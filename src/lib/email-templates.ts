import { site } from "@/lib/site";

/* Email-client-safe markup: tables, inline styles, no external images or fonts. */

const esc = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export type EmailRow = [label: string, value: string | number | null | undefined];

export type EmailContent = {
  preheader: string;
  eyebrow: string;
  heading: string;
  intro: string;
  rows?: EmailRow[];
  note?: string;
  cta?: { label: string; href: string };
};

export function renderEmail(content: EmailContent): { html: string; text: string } {
  const rows = (content.rows ?? []).filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== "");

  const rowsHtml = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 12px 10px 0;border-bottom:1px solid #edf3fd;width:38%;vertical-align:top;font:600 13px/1.45 Arial,Helvetica,sans-serif;color:#5d6178">${esc(label)}</td>
          <td style="padding:10px 0;border-bottom:1px solid #edf3fd;vertical-align:top;white-space:pre-line;font:400 15px/1.5 Arial,Helvetica,sans-serif;color:#14172e">${esc(value)}</td>
        </tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(content.heading)}</title>
</head>
<body style="margin:0;padding:0;background:#f5f7fe">
<span style="display:none!important;max-height:0;overflow:hidden;opacity:0;color:transparent">${esc(content.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fe;padding:28px 12px">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #d4e2f9;border-radius:16px;overflow:hidden">
      <tr><td style="background:#242e9b;padding:22px 28px">
        <div style="font:700 20px/1.1 Georgia,'Times New Roman',serif;letter-spacing:1px;color:#ffffff">GAP CASTLE</div>
        <div style="font:italic 13px/1.6 Georgia,'Times New Roman',serif;color:#d4e2f9">${esc(site.tagline.toLowerCase())}…</div>
      </td></tr>
      <tr><td style="height:4px;line-height:4px;font-size:0;background:#f7b733">&nbsp;</td></tr>
      <tr><td style="padding:30px 28px 32px">
        <p style="margin:0 0 10px;font:700 11px/1 Arial,Helvetica,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#242e9b">${esc(content.eyebrow)}</p>
        <h1 style="margin:0 0 14px;font:600 24px/1.3 Georgia,'Times New Roman',serif;color:#14172e">${esc(content.heading)}</h1>
        <p style="margin:0 0 22px;font:400 15px/1.65 Arial,Helvetica,sans-serif;color:#4a4f69">${esc(content.intro)}</p>
        ${rows.length ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #edf3fd">${rowsHtml}</table>` : ""}
        ${content.note ? `<p style="margin:22px 0 0;padding:14px 16px;background:#fff8e6;border-left:3px solid #f7b733;font:400 14px/1.6 Arial,Helvetica,sans-serif;color:#14172e">${esc(content.note)}</p>` : ""}
        ${content.cta ? `<p style="margin:26px 0 0"><a href="${esc(content.cta.href)}" style="display:inline-block;background:#242e9b;color:#ffffff;text-decoration:none;font:600 14px/1 Arial,Helvetica,sans-serif;padding:14px 24px;border-radius:999px">${esc(content.cta.label)}</a></p>` : ""}
      </td></tr>
      <tr><td style="padding:18px 28px;background:#0e1238;font:400 12px/1.7 Arial,Helvetica,sans-serif;color:#b8bdd6">
        ${esc(site.legalName)} · ${esc(site.address.full)}<br>
        ${esc(site.phones[0])} · <a href="mailto:${esc(site.email)}" style="color:#ffd25e;text-decoration:none">${esc(site.email)}</a>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  const text = [
    content.heading,
    "",
    content.intro,
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    content.note ? `\n${content.note}` : "",
    content.cta ? `\n${content.cta.label}: ${content.cta.href}` : "",
    "",
    "—",
    `${site.legalName} · ${site.address.full}`,
    `${site.phones[0]} · ${site.email}`,
  ].join("\n");

  return { html, text };
}
