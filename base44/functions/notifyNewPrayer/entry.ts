import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Support both direct calls (from frontend) and automation triggers (from entity event)
    const prayerData = body.data || body;
    const { name, category, request, is_anonymous } = prayerData;

    if (!request) return Response.json({ skipped: true });

    const users = await base44.asServiceRole.entities.User.list();
    const admin = users.find(u => u.role === "admin");
    if (admin) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: admin.email,
        subject: `New Prayer Request: ${category || "general"}`,
        body: `A new prayer request has been submitted on your Peace Baptist Church website.\n\nFrom: ${is_anonymous ? "Anonymous" : (name || "Not provided")}\nCategory: ${category || "Not specified"}\n\nRequest:\n${request}\n\nLog in to your admin dashboard to review and respond:\nhttps://peacebaptist.net/admin/prayers`
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});