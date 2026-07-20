import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();
const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "sunrise_school_secret_key_2026";

// Multer in-memory storage for file handling
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Cloudinary lazy initialization and wrapper
function getCloudinary() {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!name || !key || !secret) {
    return null;
  }
  cloudinary.config({
    cloud_name: name,
    api_key: key,
    api_secret: secret,
  });
  return cloudinary;
}

async function uploadFileToCloudinary(
  fileBuffer: Buffer,
  mimeType: string,
  folder: string = "sunrise"
): Promise<{ url: string; publicId: string }> {
  const c = getCloudinary();
  if (!c) {
    // Fallback: Local dataURI mock
    const base64 = fileBuffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64}`;
    return { url: dataUrl, publicId: "local_mock_" + Date.now() };
  }
  return new Promise((resolve, reject) => {
    const uploadStream = c.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload failed, using dataURI fallback:", error);
          const base64 = fileBuffer.toString("base64");
          const dataUrl = `data:${mimeType};base64,${base64}`;
          resolve({ url: dataUrl, publicId: "local_mock_" + Date.now() });
        } else if (result) {
          resolve({ url: result.secure_url, publicId: result.public_id });
        } else {
          reject(new Error("No result from Cloudinary"));
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
}

async function deleteFileFromCloudinary(publicId: string): Promise<boolean> {
  if (!publicId || publicId.startsWith("local_mock_")) {
    return true;
  }
  const c = getCloudinary();
  if (!c) return true;
  try {
    const result = await c.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (err) {
    console.error("Failed to destroy Cloudinary asset:", err);
    return false;
  }
}

// Mailer dynamic client based on DB SiteSettings
async function sendTransactionalEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  try {
    const settings = await prisma.siteSetting.findFirst({ where: { id: 1 } });
    const host = settings?.smtpHost || process.env.SMTP_HOST || "smtp.mailtrap.io";
    const port = settings?.smtpPort || Number(process.env.SMTP_PORT) || 2525;
    const user = settings?.smtpUser || process.env.SMTP_USER;
    const pass = settings?.smtpPassword || process.env.SMTP_PASS;
    const fromName = settings?.smtpFromName || "Sunrise Admissions";
    const fromEmail = settings?.smtpFromEmail || "no-reply@sunrisekindergarten.edu";

    console.log(`\n========================================\n[EMAIL DISPATCH]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body Fragment: ${html.substring(0, 300)}...`);
    console.log(`========================================\n`);

    if (!user || !pass) {
      console.log("SMTP user/pass not fully configured in settings. Email logged to terminal.");
      return true;
    }

    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (err) {
    console.error("Mailer failed to dispatch email:", err);
    return false;
  }
}

// Auth Middleware
function authenticateAdmin(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. Token missing." });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Session expired or invalid." });
  }
}

function requireSuperAdmin(req: any, res: any, next: any) {
  if (req.admin?.role !== "super_admin") {
    return res.status(403).json({ error: "Access restricted to Super Admins only." });
  }
  next();
}

function cleanPrismaUpdateData(body: any, allowedFields?: string[]) {
  const data = { ...body };
  delete data.id;
  delete data.createdAt;
  delete data.updatedAt;
  delete data.decidedAt;
  if (allowedFields) {
    for (const key of Object.keys(data)) {
      if (!allowedFields.includes(key)) {
        delete data[key];
      }
    }
  }
  return data;
}

// API Endpoints

// Settings
app.get("/api/settings", async (req, res) => {
  try {
    let settings = await prisma.siteSetting.findUnique({ where: { id: 1 } });
    if (!settings) {
      settings = await prisma.siteSetting.create({ data: { id: 1 } });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch settings." });
  }
});

app.put("/api/settings", authenticateAdmin, upload.fields([{ name: "logo" }, { name: "favicon" }]), async (req: any, res) => {
  try {
    const data = cleanPrismaUpdateData(req.body, [
      "schoolName", "tagline", "email", "phone1", "phone2", "address",
      "logoUrl", "logoPublicId", "faviconUrl", "faviconPublicId",
      "facebookUrl", "twitterUrl", "youtubeUrl", "instagramUrl", "whatsappUrl",
      "smtpHost", "smtpPort", "smtpUser", "smtpPassword", "smtpFromName", "smtpFromEmail"
    ]);
    if (data.smtpPort !== undefined) {
      data.smtpPort = parseInt(data.smtpPort, 10);
    }

    const currentSettings = await prisma.siteSetting.findUnique({ where: { id: 1 } }) || { logoUrl: "", logoPublicId: "", faviconUrl: "", faviconPublicId: "" };

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files?.logo?.[0]) {
      if (currentSettings.logoPublicId) {
        await deleteFileFromCloudinary(currentSettings.logoPublicId);
      }
      const uploaded = await uploadFileToCloudinary(files.logo[0].buffer, files.logo[0].mimetype);
      data.logoUrl = uploaded.url;
      data.logoPublicId = uploaded.publicId;
    }

    if (files?.favicon?.[0]) {
      if (currentSettings.faviconPublicId) {
        await deleteFileFromCloudinary(currentSettings.faviconPublicId);
      }
      const uploaded = await uploadFileToCloudinary(files.favicon[0].buffer, files.favicon[0].mimetype);
      data.faviconUrl = uploaded.url;
      data.faviconPublicId = uploaded.publicId;
    }

    const updated = await prisma.siteSetting.update({
      where: { id: 1 },
      data,
    });
    res.json(updated);
  } catch (err: any) {
    console.error("Update settings error:", err);
    res.status(500).json({ error: err.message || "Failed to update settings." });
  }
});

// Authentication
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  try {
    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (!admin || admin.isDeactivated) {
      return res.status(401).json({ error: "Invalid email or account is deactivated." });
    }
    const match = bcryptjs.compareSync(password, admin.passwordHash);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    // Dispatch branded email notification on login
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown";
    const userAgent = req.headers["user-agent"] || "Unknown";
    const loginTime = new Date().toLocaleString();

    await sendTransactionalEmail(
      admin.email,
      "Security Notification: Admin Login",
      `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 600px;">
        <h2 style="color: #0f172a; margin-bottom: 16px;">Admin Login Detected</h2>
        <p>Hello ${admin.name},</p>
        <p>A new admin login was recorded for your account. If this was you, no action is needed.</p>
        <div style="background-color: #f8fafc; padding: 12px; border-radius: 6px; margin: 16px 0;">
          <strong>Time:</strong> ${loginTime}<br/>
          <strong>Device/User-Agent:</strong> ${userAgent}<br/>
          <strong>IP Address:</strong> ${clientIp}
        </div>
        <p style="font-size: 13px; color: #64748b;">This is a security alert from Sunrise Kindergarten & School Admin portal.</p>
      </div>
      `
    );

    res.json({ token, admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } });
  } catch (err) {
    res.status(500).json({ error: "Server login failure." });
  }
});

app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required." });
  try {
    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (!admin) {
      // Graceful success screen for obfuscating email lists
      return res.json({ message: "If the email is registered, a password reset link has been sent." });
    }

    const token = "tok_" + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 60 mins expiry

    await prisma.passwordResetToken.create({
      data: { email, token, expiresAt },
    });

    const resetUrl = `${req.headers.referer || "http://localhost:3000/"}admin/reset-password?token=${token}`;

    await sendTransactionalEmail(
      email,
      "Password Reset Requested - Sunrise School",
      `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 600px;">
        <h2 style="color: #0f172a;">Password Reset</h2>
        <p>Hello ${admin.name},</p>
        <p>We received a request to reset your admin portal password. Please click the button below to proceed. This link expires in 60 minutes.</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background-color: #1e293b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </p>
        <p style="font-size: 13px; color: #64748b;">If you did not request this, you can safely ignore this email.</p>
      </div>
      `
    );

    res.json({ message: "If the email is registered, a password reset link has been sent." });
  } catch (err) {
    res.status(500).json({ error: "Failed to dispatch reset email." });
  }
});

app.post("/api/auth/reset-password", async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: "Token and password are required." });
  try {
    const resetRec = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!resetRec || resetRec.expiresAt < new Date()) {
      return res.status(400).json({ error: "Token is invalid or has expired." });
    }

    const passwordHash = bcryptjs.hashSync(password, 10);
    await prisma.adminUser.update({
      where: { email: resetRec.email },
      data: { passwordHash },
    });

    await prisma.passwordResetToken.delete({ where: { token } });

    res.json({ message: "Password updated successfully. You can now login." });
  } catch (err) {
    res.status(500).json({ error: "Failed to reset password." });
  }
});

app.get("/api/auth/me", authenticateAdmin, async (req: any, res) => {
  try {
    const admin = await prisma.adminUser.findUnique({ where: { id: req.admin.id } });
    if (!admin || admin.isDeactivated) {
      return res.status(401).json({ error: "User is deactivated or deleted." });
    }
    res.json({ id: admin.id, name: admin.name, email: admin.email, role: admin.role });
  } catch (err) {
    res.status(500).json({ error: "Auth session error." });
  }
});

// Admin management (super_admin only)
app.get("/api/admins", authenticateAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const list = await prisma.adminUser.findMany({
      select: { id: true, name: true, email: true, role: true, isDeactivated: true, createdAt: true },
    });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to list admin users." });
  }
});

app.post("/api/admins", authenticateAdmin, requireSuperAdmin, async (req, res) => {
  const { name, email, role, password } = req.body;
  if (!name || !email || !role) return res.status(400).json({ error: "All fields are required." });
  try {
    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: "Email is already registered." });

    // Auto-generate safe temporary password if not provided
    const tempPassword = password || Math.random().toString(36).substr(2, 10) + "A1!";
    const passwordHash = bcryptjs.hashSync(tempPassword, 10);

    const newAdmin = await prisma.adminUser.create({
      data: { name, email, role, passwordHash },
    });

    // Send welcome email with login credentials or set password notification
    const setPasswordToken = "tok_" + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    await prisma.passwordResetToken.create({
      data: { email, token: setPasswordToken, expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000) }, // 48h
    });

    const setupUrl = `${req.headers.referer || "http://localhost:3000/"}admin/reset-password?token=${setPasswordToken}`;

    await sendTransactionalEmail(
      email,
      "Welcome to Sunrise Kindergarten & School Admin Portal",
      `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 600px;">
        <h2 style="color: #0f172a;">Welcome, ${name}!</h2>
        <p>You have been assigned the role of <strong>${role}</strong> in the Sunrise School admin portal.</p>
        <p>Your login email is: <strong>${email}</strong></p>
        <p>Please click the button below to set your permanent password and access your account:</p>
        <p style="margin: 24px 0;">
          <a href="${setupUrl}" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Set Your Password</a>
        </p>
        <p style="font-size: 13px; color: #64748b;">This invitation expires in 48 hours.</p>
      </div>
      `
    );

    res.json({ message: "Admin created successfully.", admin: newAdmin });
  } catch (err) {
    res.status(500).json({ error: "Failed to create admin." });
  }
});

app.put("/api/admins/:id", authenticateAdmin, requireSuperAdmin, async (req: any, res) => {
  const adminId = parseInt(req.params.id, 10);
  const { name, role, isDeactivated } = req.body;
  try {
    const adminToEdit = await prisma.adminUser.findUnique({ where: { id: adminId } });
    if (!adminToEdit) return res.status(404).json({ error: "Admin not found." });

    // Cannot deactivate self
    if (req.admin.id === adminId && isDeactivated === true) {
      return res.status(400).json({ error: "You cannot deactivate your own account." });
    }

    const updated = await prisma.adminUser.update({
      where: { id: adminId },
      data: {
        name: name !== undefined ? name : adminToEdit.name,
        role: role !== undefined ? role : adminToEdit.role,
        isDeactivated: isDeactivated !== undefined ? isDeactivated : adminToEdit.isDeactivated,
      },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update admin." });
  }
});

app.delete("/api/admins/:id", authenticateAdmin, requireSuperAdmin, async (req: any, res) => {
  const adminId = parseInt(req.params.id, 10);
  try {
    if (req.admin.id === adminId) {
      return res.status(400).json({ error: "You cannot delete yourself." });
    }
    const supers = await prisma.adminUser.findMany({ where: { role: "super_admin", isDeactivated: false } });
    const deletingAdmin = await prisma.adminUser.findUnique({ where: { id: adminId } });

    if (deletingAdmin?.role === "super_admin" && supers.length <= 1) {
      return res.status(400).json({ error: "Cannot delete the last active Super Admin." });
    }

    await prisma.adminUser.delete({ where: { id: adminId } });
    res.json({ message: "Admin deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete admin." });
  }
});

// Slider API
app.get("/api/sliders", async (req, res) => {
  try {
    const list = await prisma.heroSlide.findMany({ orderBy: { order: "asc" } });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sliders." });
  }
});

app.post("/api/sliders", authenticateAdmin, upload.single("image"), async (req: any, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Slider image is required." });
    const { title, caption, buttonText, buttonUrl, order } = req.body;

    const uploaded = await uploadFileToCloudinary(req.file.buffer, req.file.mimetype);

    const slide = await prisma.heroSlide.create({
      data: {
        title: title || "",
        caption: caption || "",
        buttonText: buttonText || "",
        buttonUrl: buttonUrl || "",
        imageUrl: uploaded.url,
        publicId: uploaded.publicId,
        order: parseInt(order || "0", 10),
      },
    });
    res.json(slide);
  } catch (err) {
    res.status(500).json({ error: "Failed to create slider." });
  }
});

app.put("/api/sliders/:id", authenticateAdmin, upload.single("image"), async (req: any, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await prisma.heroSlide.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Slide not found." });

    const data = cleanPrismaUpdateData(req.body, ["title", "caption", "buttonText", "buttonUrl", "order", "imageUrl", "publicId"]);
    if (data.order !== undefined) data.order = parseInt(data.order, 10) || 0;

    if (req.file) {
      if (existing.publicId) {
        await deleteFileFromCloudinary(existing.publicId);
      }
      const uploaded = await uploadFileToCloudinary(req.file.buffer, req.file.mimetype);
      data.imageUrl = uploaded.url;
      data.publicId = uploaded.publicId;
    }

    const updated = await prisma.heroSlide.update({
      where: { id },
      data,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update slide." });
  }
});

app.delete("/api/sliders/:id", authenticateAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await prisma.heroSlide.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Slide not found." });

    if (existing.publicId) {
      await deleteFileFromCloudinary(existing.publicId);
    }
    await prisma.heroSlide.delete({ where: { id } });
    res.json({ message: "Slide deleted." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete slide." });
  }
});

// Facilities CRUD
app.get("/api/facilities", async (req, res) => {
  try {
    const list = await prisma.facility.findMany({ orderBy: { order: "asc" } });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch facilities." });
  }
});

app.post("/api/facilities", authenticateAdmin, async (req, res) => {
  try {
    const { title, description, icon, link, order } = req.body;
    const item = await prisma.facility.create({
      data: {
        title,
        description,
        icon: icon || "School",
        link: link || "",
        order: parseInt(order || "0", 10),
      },
    });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to create facility." });
  }
});

app.put("/api/facilities/:id", authenticateAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = cleanPrismaUpdateData(req.body, ["title", "description", "icon", "link", "order"]);
    if (data.order !== undefined) data.order = parseInt(data.order, 10) || 0;
    const updated = await prisma.facility.update({ where: { id }, data });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update facility." });
  }
});

app.delete("/api/facilities/:id", authenticateAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.facility.delete({ where: { id } });
    res.json({ message: "Facility deleted." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete facility." });
  }
});

// Stats API
app.get("/api/stats", async (req, res) => {
  try {
    const list = await prisma.stat.findMany({ orderBy: { order: "asc" } });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats." });
  }
});

app.post("/api/stats", authenticateAdmin, upload.single("image"), async (req: any, res) => {
  try {
    const { label, value, icon, suffix, order } = req.body;
    const parsedOrder = order !== undefined ? parseInt(order, 10) || 0 : 0;
    
    let imageUrl = "";
    let publicId = "";
    if (req.file) {
      const uploaded = await uploadFileToCloudinary(req.file.buffer, req.file.mimetype);
      imageUrl = uploaded.url;
      publicId = uploaded.publicId;
    }

    const item = await prisma.stat.create({
      data: {
        label: label || "",
        value: value || "",
        icon: icon || "Award",
        suffix: suffix || "",
        imageUrl,
        publicId,
        order: parsedOrder,
      },
    });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to create stat." });
  }
});

app.put("/api/stats/:id", authenticateAdmin, upload.single("image"), async (req: any, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await prisma.stat.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Stat not found." });

    const data = cleanPrismaUpdateData(req.body, ["label", "value", "icon", "suffix", "imageUrl", "publicId", "order"]);
    if (data.order !== undefined) {
      data.order = parseInt(data.order, 10) || 0;
    }

    if (req.file) {
      if (existing.publicId) {
        await deleteFileFromCloudinary(existing.publicId);
      }
      const uploaded = await uploadFileToCloudinary(req.file.buffer, req.file.mimetype);
      data.imageUrl = uploaded.url;
      data.publicId = uploaded.publicId;
    }

    const updated = await prisma.stat.update({ where: { id }, data });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update stat." });
  }
});

app.delete("/api/stats/:id", authenticateAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await prisma.stat.findUnique({ where: { id } });
    if (existing && existing.publicId) {
      await deleteFileFromCloudinary(existing.publicId);
    }
    await prisma.stat.delete({ where: { id } });
    res.json({ message: "Stat deleted." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete stat." });
  }
});

// NewsPosts CRUD
app.get("/api/news", async (req, res) => {
  try {
    const list = await prisma.newsPost.findMany({ orderBy: { createdAt: "desc" } });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch news posts." });
  }
});

app.post("/api/news", authenticateAdmin, upload.single("image"), async (req: any, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ error: "Title and Content are required." });

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") + "-" + Date.now().toString(36);

    let imageUrl = "";
    let publicId = "";

    if (req.file) {
      const uploaded = await uploadFileToCloudinary(req.file.buffer, req.file.mimetype);
      imageUrl = uploaded.url;
      publicId = uploaded.publicId;
    }

    const post = await prisma.newsPost.create({
      data: { title, slug, content, imageUrl, publicId },
    });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to create news post." });
  }
});

app.put("/api/news/:id", authenticateAdmin, upload.single("image"), async (req: any, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await prisma.newsPost.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "News post not found." });

    const data = cleanPrismaUpdateData(req.body, ["title", "slug", "content", "imageUrl", "publicId"]);

    if (req.file) {
      if (existing.publicId) {
        await deleteFileFromCloudinary(existing.publicId);
      }
      const uploaded = await uploadFileToCloudinary(req.file.buffer, req.file.mimetype);
      data.imageUrl = uploaded.url;
      data.publicId = uploaded.publicId;
    }

    if (data.title && data.title !== existing.title) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") + "-" + Date.now().toString(36);
    }

    const updated = await prisma.newsPost.update({ where: { id }, data });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update news post." });
  }
});

app.delete("/api/news/:id", authenticateAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await prisma.newsPost.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "News post not found." });

    if (existing.publicId) {
      await deleteFileFromCloudinary(existing.publicId);
    }
    await prisma.newsPost.delete({ where: { id } });
    res.json({ message: "Post deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete news post." });
  }
});

// Teachers API
app.get("/api/teachers", async (req, res) => {
  try {
    const list = await prisma.teacherStaff.findMany({ orderBy: { order: "asc" } });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch teachers." });
  }
});

app.post("/api/teachers", authenticateAdmin, upload.single("photo"), async (req: any, res) => {
  try {
    const { name, designation, facebook, twitter, linkedin, email, bio, order } = req.body;
    let photoUrl = "";
    let publicId = "";
    if (req.file) {
      const uploaded = await uploadFileToCloudinary(req.file.buffer, req.file.mimetype);
      photoUrl = uploaded.url;
      publicId = uploaded.publicId;
    }
    const teacher = await prisma.teacherStaff.create({
      data: {
        name,
        designation,
        facebook: facebook || "",
        twitter: twitter || "",
        linkedin: linkedin || "",
        email: email || "",
        bio: bio || "",
        order: parseInt(order || "0", 10),
        photoUrl,
        publicId,
      },
    });
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ error: "Failed to create teacher entry." });
  }
});

app.put("/api/teachers/:id", authenticateAdmin, upload.single("photo"), async (req: any, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await prisma.teacherStaff.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Teacher not found." });

    const data = cleanPrismaUpdateData(req.body, ["name", "designation", "facebook", "twitter", "linkedin", "email", "bio", "order", "photoUrl", "publicId"]);
    if (data.order !== undefined) data.order = parseInt(data.order, 10) || 0;

    if (req.file) {
      if (existing.publicId) {
        await deleteFileFromCloudinary(existing.publicId);
      }
      const uploaded = await uploadFileToCloudinary(req.file.buffer, req.file.mimetype);
      data.photoUrl = uploaded.url;
      data.publicId = uploaded.publicId;
    }

    const updated = await prisma.teacherStaff.update({ where: { id }, data });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update teacher." });
  }
});

app.delete("/api/teachers/:id", authenticateAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await prisma.teacherStaff.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Teacher not found." });

    if (existing.publicId) {
      await deleteFileFromCloudinary(existing.publicId);
    }
    await prisma.teacherStaff.delete({ where: { id } });
    res.json({ message: "Teacher deleted." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete teacher." });
  }
});

// Authorities API
app.get("/api/authorities", async (req, res) => {
  try {
    const list = await prisma.authority.findMany({ orderBy: { order: "asc" } });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch authorities." });
  }
});

app.post("/api/authorities", authenticateAdmin, upload.single("photo"), async (req: any, res) => {
  try {
    const { name, designation, message, type, order } = req.body;
    let photoUrl = "";
    let publicId = "";
    if (req.file) {
      const uploaded = await uploadFileToCloudinary(req.file.buffer, req.file.mimetype);
      photoUrl = uploaded.url;
      publicId = uploaded.publicId;
    }
    const item = await prisma.authority.create({
      data: {
        name,
        designation,
        message,
        type: type || "principal",
        order: parseInt(order || "0", 10),
        photoUrl,
        publicId,
      },
    });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to create authority message." });
  }
});

app.put("/api/authorities/:id", authenticateAdmin, upload.single("photo"), async (req: any, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await prisma.authority.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Authority item not found." });

    const data = cleanPrismaUpdateData(req.body, ["name", "designation", "message", "photoUrl", "publicId", "type", "order"]);
    if (data.order !== undefined) data.order = parseInt(data.order, 10) || 0;

    if (req.file) {
      if (existing.publicId) {
        await deleteFileFromCloudinary(existing.publicId);
      }
      const uploaded = await uploadFileToCloudinary(req.file.buffer, req.file.mimetype);
      data.photoUrl = uploaded.url;
      data.publicId = uploaded.publicId;
    }

    const updated = await prisma.authority.update({ where: { id }, data });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update authority item." });
  }
});

app.delete("/api/authorities/:id", authenticateAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await prisma.authority.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Authority not found." });

    if (existing.publicId) {
      await deleteFileFromCloudinary(existing.publicId);
    }
    await prisma.authority.delete({ where: { id } });
    res.json({ message: "Authority deleted." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete authority." });
  }
});

// Achievements API
app.get("/api/achievements", async (req, res) => {
  try {
    const list = await prisma.achievement.findMany({ orderBy: { id: "desc" } });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch achievements." });
  }
});

app.post("/api/achievements", authenticateAdmin, upload.single("image"), async (req: any, res) => {
  try {
    const { title, description, date } = req.body;
    let imageUrl = "";
    let publicId = "";
    if (req.file) {
      const uploaded = await uploadFileToCloudinary(req.file.buffer, req.file.mimetype);
      imageUrl = uploaded.url;
      publicId = uploaded.publicId;
    }
    const achievement = await prisma.achievement.create({
      data: { title, description, date: date || "", imageUrl, publicId },
    });
    res.json(achievement);
  } catch (err) {
    res.status(500).json({ error: "Failed to create achievement." });
  }
});

app.put("/api/achievements/:id", authenticateAdmin, upload.single("image"), async (req: any, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await prisma.achievement.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Achievement not found." });

    const data = cleanPrismaUpdateData(req.body, ["title", "description", "imageUrl", "publicId", "date"]);

    if (req.file) {
      if (existing.publicId) {
        await deleteFileFromCloudinary(existing.publicId);
      }
      const uploaded = await uploadFileToCloudinary(req.file.buffer, req.file.mimetype);
      data.imageUrl = uploaded.url;
      data.publicId = uploaded.publicId;
    }

    const updated = await prisma.achievement.update({ where: { id }, data });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update achievement." });
  }
});

app.delete("/api/achievements/:id", authenticateAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await prisma.achievement.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Achievement not found." });

    if (existing.publicId) {
      await deleteFileFromCloudinary(existing.publicId);
    }
    await prisma.achievement.delete({ where: { id } });
    res.json({ message: "Achievement deleted." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete achievement." });
  }
});

// Clubs API
app.get("/api/clubs", async (req, res) => {
  try {
    const list = await prisma.club.findMany();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch clubs." });
  }
});

app.get("/api/clubs/:idOrSlug", async (req, res) => {
  const { idOrSlug } = req.params;
  try {
    let club;
    if (isNaN(Number(idOrSlug))) {
      club = await prisma.club.findUnique({ where: { slug: idOrSlug } });
    } else {
      club = await prisma.club.findUnique({ where: { id: parseInt(idOrSlug, 10) } });
    }
    if (!club) return res.status(404).json({ error: "Club not found." });

    const members = await prisma.clubMember.findMany({ where: { clubId: club.id } });
    const gallery = await prisma.clubGalleryImage.findMany({ where: { clubId: club.id } });

    res.json({ ...club, members, gallery });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch club detail." });
  }
});

app.post("/api/clubs", authenticateAdmin, upload.single("cover"), async (req: any, res) => {
  try {
    const { name, slug, description } = req.body;
    if (!name || !description) return res.status(400).json({ error: "Name and Description are required." });

    const computedSlug = (slug || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    let coverImageUrl = "";
    let coverPublicId = "";
    if (req.file) {
      const uploaded = await uploadFileToCloudinary(req.file.buffer, req.file.mimetype);
      coverImageUrl = uploaded.url;
      coverPublicId = uploaded.publicId;
    }

    const club = await prisma.club.create({
      data: { name, slug: computedSlug, description, coverImageUrl, coverPublicId },
    });
    res.json(club);
  } catch (err) {
    res.status(500).json({ error: "Failed to create club." });
  }
});

app.put("/api/clubs/:id", authenticateAdmin, upload.single("cover"), async (req: any, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await prisma.club.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Club not found." });

    const data = cleanPrismaUpdateData(req.body, ["name", "slug", "description", "coverImageUrl", "coverPublicId"]);
    if (data.slug) {
      data.slug = data.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    }

    if (req.file) {
      if (existing.coverPublicId) {
        await deleteFileFromCloudinary(existing.coverPublicId);
      }
      const uploaded = await uploadFileToCloudinary(req.file.buffer, req.file.mimetype);
      data.coverImageUrl = uploaded.url;
      data.coverPublicId = uploaded.publicId;
    }

    const updated = await prisma.club.update({ where: { id }, data });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update club." });
  }
});

app.delete("/api/clubs/:id", authenticateAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await prisma.club.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Club not found." });

    // Delete Cover Image
    if (existing.coverPublicId) {
      await deleteFileFromCloudinary(existing.coverPublicId);
    }

    // Delete members & images
    const members = await prisma.clubMember.findMany({ where: { clubId: id } });
    for (const m of members) {
      if (m.publicId) await deleteFileFromCloudinary(m.publicId);
    }
    await prisma.clubMember.deleteMany({ where: { clubId: id } });

    const gallery = await prisma.clubGalleryImage.findMany({ where: { clubId: id } });
    for (const g of gallery) {
      if (g.publicId) await deleteFileFromCloudinary(g.publicId);
    }
    await prisma.clubGalleryImage.deleteMany({ where: { clubId: id } });

    await prisma.club.delete({ where: { id } });
    res.json({ message: "Club deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete club." });
  }
});

// Club Members & Gallery Sub-routes
app.post("/api/clubs/:clubId/members", authenticateAdmin, upload.single("photo"), async (req: any, res) => {
  const clubId = parseInt(req.params.clubId, 10);
  const { name, role } = req.body;
  try {
    let photoUrl = "";
    let publicId = "";
    if (req.file) {
      const uploaded = await uploadFileToCloudinary(req.file.buffer, req.file.mimetype);
      photoUrl = uploaded.url;
      publicId = uploaded.publicId;
    }
    const mem = await prisma.clubMember.create({
      data: { clubId, name, role, photoUrl, publicId },
    });
    res.json(mem);
  } catch (err) {
    res.status(500).json({ error: "Failed to add member." });
  }
});

app.delete("/api/clubs/:clubId/members/:memberId", authenticateAdmin, async (req, res) => {
  const memberId = parseInt(req.params.memberId, 10);
  try {
    const existing = await prisma.clubMember.findUnique({ where: { id: memberId } });
    if (existing?.publicId) {
      await deleteFileFromCloudinary(existing.publicId);
    }
    await prisma.clubMember.delete({ where: { id: memberId } });
    res.json({ message: "Member removed." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete member." });
  }
});

app.post("/api/clubs/:clubId/gallery", authenticateAdmin, upload.single("image"), async (req: any, res) => {
  const clubId = parseInt(req.params.clubId, 10);
  try {
    if (!req.file) return res.status(400).json({ error: "Image file is required." });
    const uploaded = await uploadFileToCloudinary(req.file.buffer, req.file.mimetype);
    const img = await prisma.clubGalleryImage.create({
      data: { clubId, imageUrl: uploaded.url, publicId: uploaded.publicId },
    });
    res.json(img);
  } catch (err) {
    res.status(500).json({ error: "Failed to upload image." });
  }
});

app.delete("/api/clubs/:clubId/gallery/:imgId", authenticateAdmin, async (req, res) => {
  const imgId = parseInt(req.params.imgId, 10);
  try {
    const existing = await prisma.clubGalleryImage.findUnique({ where: { id: imgId } });
    if (existing?.publicId) {
      await deleteFileFromCloudinary(existing.publicId);
    }
    await prisma.clubGalleryImage.delete({ where: { id: imgId } });
    res.json({ message: "Image deleted from club gallery." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete image." });
  }
});

// Photo Gallery API
app.get("/api/gallery", async (req, res) => {
  try {
    const list = await prisma.galleryItem.findMany({ orderBy: { createdAt: "desc" } });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch gallery." });
  }
});

app.post("/api/gallery", authenticateAdmin, upload.single("image"), async (req: any, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Gallery image is required." });
    const { title, album } = req.body;

    const uploaded = await uploadFileToCloudinary(req.file.buffer, req.file.mimetype);

    const item = await prisma.galleryItem.create({
      data: {
        title: title || "",
        album: album || "General",
        imageUrl: uploaded.url,
        publicId: uploaded.publicId,
      },
    });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to upload to gallery." });
  }
});

app.delete("/api/gallery/:id", authenticateAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await prisma.galleryItem.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Gallery item not found." });

    if (existing.publicId) {
      await deleteFileFromCloudinary(existing.publicId);
    }
    await prisma.galleryItem.delete({ where: { id } });
    res.json({ message: "Gallery item deleted." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete gallery item." });
  }
});

// Testimonials API
app.get("/api/testimonials", async (req, res) => {
  try {
    const list = await prisma.testimonial.findMany();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch testimonials." });
  }
});

app.post("/api/testimonials", authenticateAdmin, async (req, res) => {
  try {
    const { name, role, content, rating } = req.body;
    const item = await prisma.testimonial.create({
      data: { name, role, content, rating: parseInt(rating || "5", 10) },
    });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to save testimonial." });
  }
});

app.put("/api/testimonials/:id", authenticateAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = cleanPrismaUpdateData(req.body, ["name", "role", "content", "rating"]);
    if (data.rating !== undefined) data.rating = parseInt(data.rating, 10) || 5;
    const updated = await prisma.testimonial.update({ where: { id }, data });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update testimonial." });
  }
});

app.delete("/api/testimonials/:id", authenticateAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.testimonial.delete({ where: { id } });
    res.json({ message: "Testimonial deleted." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete testimonial." });
  }
});

// Routines API (with filter and classLevel)
app.get("/api/routines", async (req, res) => {
  try {
    const list = await prisma.routine.findMany({ orderBy: { createdAt: "desc" } });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch routines." });
  }
});

app.post("/api/routines", authenticateAdmin, upload.single("pdf"), async (req: any, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "PDF file is required." });
    const { title, description, classLevel } = req.body;

    const uploaded = await uploadFileToCloudinary(req.file.buffer, req.file.mimetype);

    const routine = await prisma.routine.create({
      data: {
        title,
        description: description || "",
        classLevel: classLevel || "All",
        pdfUrl: uploaded.url,
        publicId: uploaded.publicId,
      },
    });
    res.json(routine);
  } catch (err) {
    res.status(500).json({ error: "Failed to upload routine PDF." });
  }
});

app.delete("/api/routines/:id", authenticateAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await prisma.routine.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Routine not found." });

    if (existing.publicId) {
      await deleteFileFromCloudinary(existing.publicId);
    }
    await prisma.routine.delete({ where: { id } });
    res.json({ message: "Routine deleted." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete routine." });
  }
});

// Examination PDFs API
app.get("/api/exams", async (req, res) => {
  try {
    const list = await prisma.examPdf.findMany({ orderBy: { createdAt: "desc" } });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch exam PDFs." });
  }
});

app.post("/api/exams", authenticateAdmin, upload.single("pdf"), async (req: any, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "PDF file is required." });
    const { title, description, classLevel } = req.body;

    const uploaded = await uploadFileToCloudinary(req.file.buffer, req.file.mimetype);

    const exam = await prisma.examPdf.create({
      data: {
        title,
        description: description || "",
        classLevel: classLevel || "All",
        pdfUrl: uploaded.url,
        publicId: uploaded.publicId,
      },
    });
    res.json(exam);
  } catch (err) {
    res.status(500).json({ error: "Failed to upload exam PDF." });
  }
});

app.delete("/api/exams/:id", authenticateAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await prisma.examPdf.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Exam PDF not found." });

    if (existing.publicId) {
      await deleteFileFromCloudinary(existing.publicId);
    }
    await prisma.examPdf.delete({ where: { id } });
    res.json({ message: "Exam PDF deleted." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete exam PDF." });
  }
});

// Academic Blocks (Static/Rich-Text Content Blocks)
app.get("/api/academic-blocks", async (req, res) => {
  try {
    const list = await prisma.academicBlock.findMany();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch academic blocks." });
  }
});

app.put("/api/academic-blocks/:section", authenticateAdmin, upload.single("image"), async (req: any, res) => {
  const { section } = req.params;
  const { title, content } = req.body;
  try {
    let block = await prisma.academicBlock.findUnique({ where: { section } });

    let imageUrl = block?.imageUrl || "";
    let publicId = block?.publicId || "";

    if (req.file) {
      if (block?.publicId) {
        await deleteFileFromCloudinary(block.publicId);
      }
      const uploaded = await uploadFileToCloudinary(req.file.buffer, req.file.mimetype);
      imageUrl = uploaded.url;
      publicId = uploaded.publicId;
    }

    if (block) {
      block = await prisma.academicBlock.update({
        where: { section },
        data: { title, content, imageUrl, publicId },
      });
    } else {
      block = await prisma.academicBlock.create({
        data: { section, title, content, imageUrl, publicId },
      });
    }
    res.json(block);
  } catch (err) {
    res.status(500).json({ error: "Failed to update block." });
  }
});

// Public Admissions Application
app.post("/api/admissions", upload.single("document"), async (req: any, res) => {
  const { studentName, dob, classApplyingFor, guardianName, guardianPhone, guardianEmail, address } = req.body;
  if (!studentName || !dob || !classApplyingFor || !guardianName || !guardianPhone || !guardianEmail || !address) {
    return res.status(400).json({ error: "All student and guardian details are required." });
  }
  try {
    let documentUrl = "";
    let documentPublicId = "";
    if (req.file) {
      const uploaded = await uploadFileToCloudinary(req.file.buffer, req.file.mimetype);
      documentUrl = uploaded.url;
      documentPublicId = uploaded.publicId;
    }

    const appRecord = await prisma.admissionApplication.create({
      data: {
        studentName,
        dob,
        classApplyingFor,
        guardianName,
        guardianPhone,
        guardianEmail,
        address,
        documentUrl,
        documentPublicId,
        status: "Pending",
      },
    });

    // Send confirmation email to parent
    await sendTransactionalEmail(
      guardianEmail,
      "Admission Application Received - Sunrise School",
      `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 600px;">
        <h2 style="color: #0f172a;">Application Submitted Successfully</h2>
        <p>Dear ${guardianName},</p>
        <p>Thank you for choosing Sunrise Kindergarten & School. We have successfully received your admission application for <strong>${studentName}</strong> (Class: <strong>${classApplyingFor}</strong>).</p>
        <p>Your application status is currently <strong>Pending Review</strong>. We will contact you shortly after reviewing the documents.</p>
        <div style="background-color: #f8fafc; padding: 12px; border-radius: 6px; margin: 16px 0;">
          <strong>Student Name:</strong> ${studentName}<br/>
          <strong>Date of Birth:</strong> ${dob}<br/>
          <strong>Class Applying For:</strong> ${classApplyingFor}<br/>
          <strong>Reference ID:</strong> SUN-${appRecord.id}
        </div>
        <p style="font-size: 13px; color: #64748b;">If you have any questions, feel free to reply to this email or call our hotline.</p>
      </div>
      `
    );

    res.json({ message: "Application submitted successfully.", application: appRecord });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit admission form." });
  }
});

// Admin Admissions Management
app.get("/api/admissions", authenticateAdmin, async (req, res) => {
  try {
    const list = await prisma.admissionApplication.findMany({ orderBy: { createdAt: "desc" } });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch admissions applications." });
  }
});

app.put("/api/admissions/:id/status", authenticateAdmin, async (req: any, res) => {
  const id = parseInt(req.params.id, 10);
  const { status, adminNotes } = req.body;
  if (!["Accepted", "Rejected", "Pending"].includes(status)) {
    return res.status(400).json({ error: "Invalid status." });
  }
  try {
    const appRecord = await prisma.admissionApplication.findUnique({ where: { id } });
    if (!appRecord) return res.status(404).json({ error: "Application not found." });

    const updated = await prisma.admissionApplication.update({
      where: { id },
      data: {
        status,
        adminNotes: adminNotes || appRecord.adminNotes,
        decidedBy: req.admin.name,
        decidedAt: new Date(),
      },
    });

    // Send outcome email to guardian
    const emailSubject = status === "Accepted" 
      ? "Congratulations! Admission Approved - Sunrise School" 
      : "Admission Status Update - Sunrise School";

    const emailHtml = status === "Accepted" 
      ? `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 600px;">
          <h2 style="color: #16a34a;">Admission Approved!</h2>
          <p>Dear ${appRecord.guardianName},</p>
          <p>We are delighted to inform you that the admission application for <strong>${appRecord.studentName}</strong> to class <strong>${appRecord.classApplyingFor}</strong> has been <strong>ACCEPTED</strong>!</p>
          <div style="background-color: #f0fdf4; padding: 12px; border-radius: 6px; margin: 16px 0; border: 1px solid #bbf7d0;">
            <strong>Ref ID:</strong> SUN-${appRecord.id}<br/>
            <strong>Remarks/Steps:</strong> Please visit the administrative building with physical copies of the birth certificate and guardian photos to complete enrollment within 7 working days.
          </div>
          <p>We look forward to welcoming your child to our vibrant student community!</p>
          <p style="font-size: 13px; color: #64748b;">Sincerely,<br/>Office of Admissions<br/>Sunrise Kindergarten & School</p>
        </div>
      `
      : `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 600px;">
          <h2 style="color: #dc2626;">Admission Status Update</h2>
          <p>Dear ${appRecord.guardianName},</p>
          <p>Thank you for your interest in Sunrise Kindergarten & School.</p>
          <p>After careful review of your application for <strong>${appRecord.studentName}</strong>, we regret to inform you that we are unable to offer admission at this time.</p>
          ${adminNotes ? `<p><strong>Admissions Office Notes:</strong> ${adminNotes}</p>` : ""}
          <p style="font-size: 13px; color: #64748b;">If you believe this was an error or would like to appeal, please contact the main office.</p>
        </div>
      `;

    await sendTransactionalEmail(appRecord.guardianEmail, emailSubject, emailHtml);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update admission status." });
  }
});

// CSV Export for Admissions
app.get("/api/admissions/export", authenticateAdmin, async (req, res) => {
  try {
    const list = await prisma.admissionApplication.findMany({ orderBy: { createdAt: "desc" } });
    let csv = "ID,Student Name,DOB,Class,Guardian Name,Guardian Phone,Guardian Email,Address,Status,Decided By,Submitted At\n";
    for (const appItem of list) {
      csv += `${appItem.id},"${appItem.studentName.replace(/"/g, '""')}","${appItem.dob}","${appItem.classApplyingFor}","${appItem.guardianName.replace(/"/g, '""')}","${appItem.guardianPhone}","${appItem.guardianEmail}","${appItem.address.replace(/"/g, '""')}","${appItem.status}","${appItem.decidedBy}","${appItem.createdAt.toISOString()}"\n`;
    }
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=admissions_export.csv");
    res.status(200).send(csv);
  } catch (err) {
    res.status(500).send("CSV export failed.");
  }
});

// Dashboard Statistics
app.get("/api/dashboard/stats", authenticateAdmin, async (req, res) => {
  try {
    const counts = {
      sliders: await prisma.heroSlide.count(),
      facilities: await prisma.facility.count(),
      stats: await prisma.stat.count(),
      news: await prisma.newsPost.count(),
      teachers: await prisma.teacherStaff.count(),
      authorities: await prisma.authority.count(),
      achievements: await prisma.achievement.count(),
      clubs: await prisma.club.count(),
      gallery: await prisma.galleryItem.count(),
      testimonials: await prisma.testimonial.count(),
      routines: await prisma.routine.count(),
      exams: await prisma.examPdf.count(),
      admissions: await prisma.admissionApplication.count(),
    };
    const pendingAdmissions = await prisma.admissionApplication.count({ where: { status: "Pending" } });
    const recentAdmissions = await prisma.admissionApplication.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });
    res.json({ counts, pendingAdmissions, recentAdmissions });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve dashboard stats." });
  }
});

// Contact Us form submission (Public)
app.post("/api/contact", async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, Email, and Message are required fields." });
  }
  try {
    // Forward message to school administration
    const settings = await prisma.siteSetting.findFirst({ where: { id: 1 } });
    const adminEmail = settings?.email || "info@sunrisekindergarten.edu";

    await sendTransactionalEmail(
      adminEmail,
      `[Contact Form] ${subject || "Inquiry from Website"}`,
      `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 600px;">
        <h2 style="color: #0f172a;">New Contact Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
        <p><strong>Subject:</strong> ${subject || "None"}</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap; background-color: #f8fafc; padding: 12px; border-radius: 6px;">${message}</p>
      </div>
      `
    );

    res.json({ message: "Message submitted successfully. Our administration will contact you shortly." });
  } catch (err) {
    res.status(500).json({ error: "Failed to dispatch contact message." });
  }
});

// Database Seed routine (Called once when server starts)
async function seedDatabase() {
  try {
    // 1. SiteSettings
    const settingsCount = await prisma.siteSetting.count();
    if (settingsCount === 0) {
      await prisma.siteSetting.create({
        data: {
          id: 1,
          schoolName: "Sunrise Kindergarten & School",
          tagline: "Shaping Brilliance, Character & Future",
          email: "admissions@sunrisekindergarten.edu",
          phone1: "+880 1711-123456",
          phone2: "+880 1811-987654",
          address: "Road 12, Sector 4, Uttara, Dhaka, Bangladesh",
          facebookUrl: "https://facebook.com/sunrisekg",
          twitterUrl: "https://twitter.com/sunrisekg",
          youtubeUrl: "https://youtube.com/sunrisekg",
          instagramUrl: "https://instagram.com/sunrisekg",
          whatsappUrl: "https://wa.me/8801711123456",
        },
      });
      console.log("[SEED] SiteSettings seeded.");
    }

    // 2. AdminUser (super_admin)
    const adminCount = await prisma.adminUser.count();
    if (adminCount === 0) {
      const passwordHash = bcryptjs.hashSync("admin123", 10);
      await prisma.adminUser.create({
        data: {
          name: "Super Administrator",
          email: "admin@sunrise.edu",
          passwordHash,
          role: "super_admin",
        },
      });
      console.log("\n==================================================");
      console.log("[SEED] Default Super Admin seeded successfully!");
      console.log("Email: admin@sunrise.edu");
      console.log("Password: admin123");
      console.log("==================================================\n");
    }

    // 3. HeroSliders
    const slideCount = await prisma.heroSlide.count();
    if (slideCount === 0) {
      await prisma.heroSlide.createMany({
        data: [
          {
            title: "Dynamic Learning Environment",
            caption: "Nurturing curious minds and building foundational skills in a creative space.",
            buttonText: "Apply Now",
            buttonUrl: "/admission",
            imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=1200",
            order: 1,
          },
          {
            title: "State-of-the-Art Interactive Classrooms",
            caption: "Using modern multimedia smartboards and tactile activities for optimal comprehension.",
            buttonText: "Explore Facilities",
            buttonUrl: "/facilities",
            imageUrl: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=1200",
            order: 2,
          },
        ],
      });
      console.log("[SEED] Hero slides seeded.");
    }

    // 4. Facilities
    const facCount = await prisma.facility.count();
    if (facCount === 0) {
      await prisma.facility.createMany({
        data: [
          {
            title: "Multimedia Smart Classrooms",
            description: "Equipped with interactive screens and digital curriculum tools to enhance sensory-based learning.",
            icon: "Tv",
            link: "/facilities",
            order: 1,
          },
          {
            title: "Safe Transport Fleet",
            description: "Fitted with real-time GPS tracking and strictly monitored helpers for secure pick-and-drop.",
            icon: "Bus",
            link: "/facilities",
            order: 2,
          },
          {
            title: "Eco-Friendly Outdoor Playground",
            description: "Spacious playground with soft turf flooring, sandbox, slide-climbers, and interactive gaming areas.",
            icon: "Trees",
            link: "/facilities",
            order: 3,
          },
        ],
      });
      console.log("[SEED] Facilities seeded.");
    }

    // 5. Statistics
    const statCount = await prisma.stat.count();
    if (statCount === 0) {
      await prisma.stat.createMany({
        data: [
          { label: "Active Students", value: "650+", icon: "Users" },
          { label: "Certified Educators", value: "38+", icon: "GraduationCap" },
          { label: "Modern Labs & Clubs", value: "12", icon: "Library" },
          { label: "Board Success Rate", value: "100%", icon: "Award" },
        ],
      });
      console.log("[SEED] Stats seeded.");
    }

    // 6. NewsPosts
    const newsCount = await prisma.newsPost.count();
    if (newsCount === 0) {
      await prisma.newsPost.createMany({
        data: [
          {
            title: "Admissions Open for Academic Session 2026-2027",
            slug: "admissions-open-2026-2027",
            content: "We are thrilled to open applications for Preschool, KG, and Grades 1-5 for the next session. Fill out the public online form to secure a screening slot today. Early registration discounts are available until the end of next month.",
            imageUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=800",
          },
          {
            title: "Sunrise Annual Sports Day Scheduled for Next Week",
            slug: "annual-sports-day-2026",
            content: "The annual sports day of Sunrise Kindergarten & School is scheduled for Friday. Students will showcase their athletics skills, relay racing, gymnastics, and karate routines. Parents are cordially invited to attend and cheer for their kids.",
            imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800",
          },
        ],
      });
      console.log("[SEED] NewsPosts seeded.");
    }

    // 7. Academic Blocks (Brief History, hostel, etc.)
    const blockCount = await prisma.academicBlock.count();
    if (blockCount === 0) {
      await prisma.academicBlock.createMany({
        data: [
          {
            section: "brief_history",
            title: "Our Heritage: Serving Uttara Since 2011",
            content: "Sunrise Kindergarten & School was founded in 2011 with the express goal of establishing an English-Version curriculum that prioritizes analytical skills, cultural pride, and moral foundations. Over the years, we have graduated hundreds of students who are now studying in elite high schools and colleges across Bangladesh and abroad.",
            imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800",
          },
          {
            section: "school_feature",
            title: "Distinctive Advantages of Sunrise School",
            content: "We believe educational success relies on an interactive ecosystem. That is why we provide a low 1:15 teacher-to-student ratio, complete CCTV coverage across all floors, custom moral code training sessions, modern STEM kits, and full-time medical and psychological advisory resources.",
            imageUrl: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800",
          },
          {
            section: "academic_overview",
            title: "Dynamic Academic Framework",
            content: "Our academic curriculum integrates the official National Curriculum (English Version) with international standards in science, mathematical logical analysis, and linguistics. We focus heavily on speaking confidence, reading habits, and project-based assignments.",
            imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800",
          },
          {
            section: "hostel",
            title: "Home Away From Home: Residential Care",
            content: "Sunrise provides state-of-the-art boarding and hostel facilities for students. Our hostel offers clean double-sharing rooms, balanced multi-cuisine diet under nutritionist review, daily monitored homework support hours, and multi-layered physical security checks.",
            imageUrl: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800",
          },
          {
            section: "co_curricular",
            title: "Co-Curricular & Physical Development",
            content: "We strongly emphasize that learning extends far beyond class walls. Students actively participate in weekly co-curricular clubs including debates, art and calligraphy, robotics, chess, football leagues, and martial arts (taekwondo).",
            imageUrl: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=800",
          },
        ],
      });
      console.log("[SEED] Academic Blocks seeded.");
    }

    // 8. Clubs
    const clubCount = await prisma.club.count();
    if (clubCount === 0) {
      const scienceClub = await prisma.club.create({
        data: {
          name: "Science & Robotics Club",
          slug: "science-robotics-club",
          description: "Hands-on engineering, simple circuit construction, mechanics, and chemistry puzzles to inspire early innovators.",
          coverImageUrl: "https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?auto=format&fit=crop&q=80&w=800",
        },
      });

      const artsClub = await prisma.club.create({
        data: {
          name: "Arts & Crafts Club",
          slug: "arts-crafts-club",
          description: "Watercolors, origami, paper-mache, and canvas painting blocks designed to foster maximum fine-motor creativity.",
          coverImageUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=800",
        },
      });

      // Seed Club Members
      await prisma.clubMember.createMany({
        data: [
          { clubId: scienceClub.id, name: "Dr. Rakibul Hasan", role: "Club Moderator & Senior Physics Teacher" },
          { clubId: scienceClub.id, name: "Aurnab Sen", role: "Student Coordinator (Class 5)" },
          { clubId: artsClub.id, name: "Nusrat Jahan", role: "Art Faculty & Lead Designer" },
        ],
      });

      console.log("[SEED] Clubs and club members seeded.");
    }

    // 9. Teachers/Staff
    const teacherCount = await prisma.teacherStaff.count();
    if (teacherCount === 0) {
      await prisma.teacherStaff.createMany({
        data: [
          {
            name: "Mrs. Afroza Chowdhury",
            designation: "Senior Headmistress",
            photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
            email: "headmistress@sunrisekindergarten.edu",
            bio: "With over 20 years of experience in early childcare education, she leads the academic design and moral mentoring strategies at Sunrise.",
            order: 1,
          },
          {
            name: "Mr. Tanveer Rahman",
            designation: "Senior Mathematics Coordinator",
            photoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400",
            email: "tanveer.math@sunrisekindergarten.edu",
            bio: "He uses advanced spatial teaching kits and tactile blocks to make complex algebraic and geometrical logic enjoyable for kids.",
            order: 2,
          },
        ],
      });
      console.log("[SEED] Teachers seeded.");
    }

    // 10. Authorities
    const authListCount = await prisma.authority.count();
    if (authListCount === 0) {
      await prisma.authority.createMany({
        data: [
          {
            name: "Barrister Rafiqul Islam",
            designation: "Chairman of the Governing Body",
            message: "Our vision is to build an institution where children learn to create, think critically, and grow as morally sound, helpful human beings. Sunrise is focused on preparing kids for the dynamic skills of the next century.",
            photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400",
            type: "chair",
            order: 1,
          },
          {
            name: "Mrs. Afroza Chowdhury",
            designation: "Principal",
            message: "Welcome to Sunrise Kindergarten & School. We understand that early childhood is the prime window of cognitive mapping. Our carefully crafted smart curricula ensure kids discover their hidden potential naturally.",
            photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
            type: "principal",
            order: 2,
          },
        ],
      });
      console.log("[SEED] Authorities messages seeded.");
    }

    // 11. Testimonials
    const testCount = await prisma.testimonial.count();
    if (testCount === 0) {
      await prisma.testimonial.createMany({
        data: [
          {
            name: "Mahmudul Hasan (Parent of Safwan, Class 2)",
            role: "Software Architect",
            content: "The level of personal attention at Sunrise is incredible. My son went from struggling with basic division to loving mathematics in just six months. The digital smartboards and friendly environment make a massive difference.",
            rating: 5,
          },
          {
            name: "Farhana Yasmin (Parent of Aisha, KG)",
            role: "Banker",
            content: "Excellent security setup! The real-time school bus tracking app gives me complete peace of mind. The teachers are exceptionally warm and patient, and they maintain neat classroom hygiene.",
            rating: 5,
          },
        ],
      });
      console.log("[SEED] Testimonials seeded.");
    }

    // 12. Gallery
    const galleryCount = await prisma.galleryItem.count();
    if (galleryCount === 0) {
      await prisma.galleryItem.createMany({
        data: [
          { title: "Science Laboratory Activity", album: "Campus", imageUrl: "https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?auto=format&fit=crop&q=80&w=800" },
          { title: "Children's Art Session", album: "Events", imageUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=800" },
          { title: "Outdoor Sports Play", album: "Sports", imageUrl: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=800" },
        ],
      });
      console.log("[SEED] Gallery items seeded.");
    }
  } catch (err) {
    console.error("[SEED ERROR] Database seed failed:", err);
  }
}

// Invoke Seed
seedDatabase();

// Vite integration middleware & Asset serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
