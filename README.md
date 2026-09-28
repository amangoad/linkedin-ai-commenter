# LinkedIn AI Commenter — Online Backend Edition

Chrome extension that reads the LinkedIn post associated with the active comment box, generates three relevant comment options through your online API, and places the selected comment into the LinkedIn comment editor. You manually review and submit the comment.

## 1. Deploy the backend once

This project is Vercel-ready. Import the project folder into Vercel and add this environment variable:

`OPENAI_API_KEY=your_openai_api_key`

The API endpoint after deployment is:

`https://YOUR-VERCEL-DOMAIN.vercel.app/api/comments`

No local Node.js server is required after deployment.

## 2. Configure the extension

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the `extension` folder.
5. Open the extension's **Options** page.
6. Enter your HTTPS API URL, for example `https://your-project.vercel.app/api/comments`.
7. Save.

## 3. Use it

1. Open LinkedIn.
2. Open a post.
3. Click inside its comment box.
4. Click **✨ AI Comment**.
5. Select a style and generate.
6. Click **Use this comment**.
7. Review/edit it and click LinkedIn's own Post button.

## Security

Do NOT put your OpenAI API key in the Chrome extension. It belongs only in the Vercel environment variable.
