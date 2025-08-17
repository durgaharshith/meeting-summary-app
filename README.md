# AI Transcript Summarizer

## Overview

This project is an AI-powered web application that allows users to upload transcripts (DOCX, TXT), generate summaries using a custom prompt, and share the summaries via email. It leverages the Gemini API for summarization and Node.js/Express for the backend. The frontend is built with basic HTML, CSS, and JavaScript for simplicity and focus on functionality.

## Tech Stack

*   **Backend:**
    *   Node.js
    *   Express.js
    *   Gemini API (for summarization)
    *   Nodemailer (for sending emails)
    *   Multer (for file uploads)
    *   mammoth (for DOCX parsing)
*   **Frontend:**
    *   HTML
    *   CSS
    *   JavaScript
*   **Deployment:**
    *   Render

## Approach and Process

1.  **Requirements Analysis:**  The project began with a thorough understanding of the assignment requirements, focusing on the core functionality of file upload, summarization, and email sharing.
2.  **Tech Stack Selection:** Node.js and Express were chosen for the backend due to familiarity and ease of use. Gemini was selected as the AI model provider as specified in the assignment. HTML, CSS, and JavaScript were chosen for the frontend to maintain simplicity.
3.  **Backend Development:** The backend was developed first, implementing the API endpoints for file upload, summarization, and email sharing. The Gemini API was integrated for summarization, and Nodemailer was used for email sending.
4.  **Frontend Development:** The frontend was developed using basic HTML, CSS, and JavaScript. It provides a simple user interface for uploading transcripts, entering prompts, generating summaries, and sharing them via email.
5.  **Testing:** The API endpoints were thoroughly tested using Postman before integrating them with the frontend.
6.  **Deployment:** The backend was deployed to Render, a cloud platform for deploying web applications.
7.  **Iterative Refinement:** The project was iteratively refined based on testing and feedback.

## Project Setup and Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/durgaharshith/meeting-summary-app.git
    cd server
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**

    Create a `.env` file in the root directory and add the following variables:

    ```
    Gemini_API_KEY=your_Gemini_api_key
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USER=your_email@gmail.com
    SMTP_PASS=your_email_password
    FROM_EMAIL=your_email@gmail.com
    ```

    Replace the placeholder values with your actual credentials.

## Running the Application

1.  **Start the development server:**

    ```bash
    npm start
    ```

    This will start the Node.js server and the application will be accessible at `http://localhost:3001`.

## Deployment to Render

1.  **Push the code to a Git repository (e.g., GitHub).**
2.  **Create a new Web Service on Render.**
3.  **Connect your Git repository to the Render Web Service.**
4.  **Set the Build Command to an empty string.**
5.  **Set the Start Command to `node server.js`.**
6.  **Configure the environment variables (Gemini_API_KEY, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL) in the Render dashboard.**
7.  **Deploy the application.**

## Key Features

*   **File Upload:** Supports PDF, DOCX, and TXT files.
*   **AI Summarization:** Generates summaries using the Gemini API.
*   **Custom Prompts:** Allows users to customize the summarization process with specific instructions.
*   **Email Sharing:** Enables users to share summaries via email.
*   **Simple User Interface:** Provides a clean and intuitive user experience.

## Future Enhancements

*   **User Authentication:** Implement user accounts and authentication.
*   **Database Integration:** Store transcripts and summaries in a database for persistence.
*   **Advanced Editing Features:** Add more advanced editing features to the summary editor.
*   **Improved Error Handling:** Implement more robust error handling and logging.
*   **Frontend Framework:** Consider using a frontend framework (e.g., React, Vue.js) for a more complex and interactive user interface.
