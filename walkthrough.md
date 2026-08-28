# 🌐 PBR VITS Student Companion - Live Cloud Application

## 🎉 Full-Stack Cloud Deployment Summary

Your final-year project **PBR VITS Student Companion** is now fully converted into a publicly accessible, high-performance cloud application running 24/7 in the cloud without needing your laptop!

---

### 🔗 Live Access URLs

- **Public Frontend Website**: [https://pbr-vits-companion.vercel.app](https://pbr-vits-companion.vercel.app)
- **Public Backend API**: [https://pbr-vits-companion.onrender.com](https://pbr-vits-companion.onrender.com)
- **GitHub Repository**: [https://github.com/Indorusky/pbr-vits-companion](https://github.com/Indorusky/pbr-vits-companion)
- **Database**: Cloud Supabase PostgreSQL (`db.zyrszkojujlsbapzyjrn.supabase.co`)

---

### ⚡ What Was Accomplished:

1. **Security & GitHub Repository**:
   - Strictly ignored `.env` and sensitive passwords via `.gitignore`.
   - Created clean initial commit and pushed all source code to `Indorusky/pbr-vits-companion` on GitHub.

2. **Cloud PostgreSQL Database (Supabase)**:
   - Configured SQLAlchemy models for PostgreSQL.
   - Executed batch migration script `migrate_to_cloud.py`.
   - Migrated all **56 Users**, **53 Faculty**, **960 Timetable Entries**, **2 Face Enrollment Embeddings**, **8 Attendance Logs**, **40 Marks Records**, and **System Configurations**.

3. **Backend Deployment (Render)**:
   - Deployed Python FastAPI server on Render.
   - Configured `DATABASE_URL` environment variables securely.
   - Added startup safeguards to prevent re-seeding populated databases.

4. **Frontend Deployment (Vercel)**:
   - Deployed React / Vite Single Page Application on Vercel.
   - Connected `VITE_API_BASE_URL` to the Render backend.
   - Integrated college logo (`/pbr_vits_logo.png`) and **Visvodaya Institute of Technology & Sciences** branding across all pages.
