type MagicLinkEmailProps = {
  actionUrl: string;
  firstName: string;
  mailType: "login" | "register";
  siteName: string;
};

export const MagicLinkEmail = ({ firstName, actionUrl, mailType, siteName }: MagicLinkEmailProps) => {
  return `
    <html>
      <head>
        <title>${siteName}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            width: 60px;
            height: 60px;
            margin-bottom: 20px;
          }
          .title {
            font-size: 24px;
            font-weight: 600;
            color: #333333;
            margin-bottom: 10px;
          }
          .content {
            font-size: 16px;
            color: #555555;
            line-height: 1.6;
            margin-bottom: 20px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #000000;
            color: #ffffff;
            text-decoration: none;
            border-radius: 4px;
            font-size: 16px;
            font-weight: 500;
            margin: 20px 0;
          }
          .footer {
            font-size: 14px;
            color: #777777;
            text-align: center;
            margin-top: 30px;
          }
          .divider {
            border: 1px solid #eaeaea;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://drive.frs.com.my/share/HDbCa5QjLU9euLnN" alt="Logo" class="logo">
            <h1 class="title">${siteName}</h1>
          </div>
          <div class="content">
            <p>Hi ${firstName},</p>
            <p>Welcome to ${siteName}! Click the link below to ${mailType === "login" ? "sign in to" : "activate"} your account.</p>
            <div style="text-align: center;">
              <a href="${actionUrl}" class="button">
                ${mailType === "login" ? "Sign in" : "Activate Account"}
              </a>
            </div>
            <p>This link expires in 24 hours and can only be used once.</p>
            ${mailType === "login" ? `
              <p>If you did not try to log into your account, you can safely ignore it.</p>
            ` : ""}
          </div>
          <div class="divider"></div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};