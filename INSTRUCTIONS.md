Here is a step-by-step guide to get your Daily Goal Tracker application working with Supabase, GitHub, and Netlify.

### 1. Supabase Setup

First, you need to set up your Supabase project and database.

**1.1. Create a New Supabase Project**

1.  Go to [supabase.com](https://supabase.com) and sign in.
2.  On your dashboard, click **New project**.
3.  Choose an organization and give your project a **Name**.
4.  Generate a secure **Database Password** and save it somewhere safe.
5.  Choose the **Region** closest to your users.
6.  Click **Create new project**.

**1.2. Create the `goals` Table**

1.  In your new Supabase project, go to the **SQL Editor** in the left sidebar.
2.  Click **New query**.
3.  Paste the following SQL code and click **RUN**:

    ```sql
    CREATE TABLE goals (
      id SERIAL PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) NOT NULL,
      text TEXT NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );
    ```

**1.3. Enable Row Level Security (RLS)**

For security, you need to enable Row Level Security on the `goals` table. This ensures that users can only access their own data.

1.  Go to the **SQL Editor**.
2.  Run the following command:

    ```sql
    ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
    ```

**1.4. Create Security Policies**

Now, create policies to define who can access and modify the data in the `goals` table.

1.  Go to the **SQL Editor**.
2.  Run the following SQL commands one by one:

    *   **Allow users to view their own goals:**

        ```sql
        CREATE POLICY "Enable read access for authenticated users"
        ON goals FOR SELECT
        USING (auth.uid() = user_id);
        ```

    *   **Allow users to create new goals:**

        ```sql
        CREATE POLICY "Enable insert for authenticated users"
        ON goals FOR INSERT
        WITH CHECK (auth.uid() = user_id);
        ```

    *   **Allow users to update their own goals:**

        ```sql
        CREATE POLICY "Enable update for authenticated users"
        ON goals FOR UPDATE
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
        ```

    *   **Allow users to delete their own goals:**

        ```sql
        CREATE POLICY "Enable delete for authenticated users"
        ON goals FOR DELETE
        USING (auth.uid() = user_id);
        ```

**1.5. Get Your Supabase Credentials**

1.  Go to **Project Settings** (the gear icon in the left sidebar).
2.  Click on **API**.
3.  Under **Project API Keys**, you will find your **URL** and your `anon` **public** key. You will need these for your Netlify setup.

### 2. GitHub Setup

Next, you need to get your code into a GitHub repository.

1.  Go to [github.com](https://github.com) and create a new repository.
2.  Follow the instructions to push your existing local repository to GitHub. If you haven't initialized a git repository yet, do the following in your project folder:

    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/your-username/your-repo-name.git
    git push -u origin main
    ```

### 3. Netlify Setup

Finally, you will deploy your application using Netlify.

**3.1. Create a New Site**

1.  Log in to your Netlify account.
2.  Click **Add new site** > **Import an existing project**.
3.  Connect to **GitHub** and authorize Netlify to access your repositories.
4.  Choose the repository you just created.

**3.2. Configure Build Settings**

*   **Branch to deploy:** `main`
*   **Build command:** Leave this blank.
*   **Publish directory:** `.` (the root of your repository).

**3.3. Add Environment Variables**

This is the most important step for connecting your application to your Supabase backend.

1.  Go to your site's **Settings** > **Build & deploy** > **Environment**.
2.  Click **Edit variables**.
3.  Add the following two variables:

    *   **Key:** `SUPABASE_URL`
        **Value:** Your Supabase project URL (from step 1.5).
    *   **Key:** `SUPABASE_ANON_KEY`
        **Value:** Your Supabase `anon` public key (from step 1.5).

**3.4. How Your Keys Are Handled Securely**

You are correct to be concerned about putting secret keys in your public-facing code. The setup in this project handles this securely:

*   Your `SUPABASE_URL` and `SUPABASE_ANON_KEY` are stored as **environment variables** in Netlify. They are not visible in your public GitHub repository.
*   The serverless function `netlify/functions/goals.js` can access these variables directly on the server using `process.env`.
*   The new serverless function `netlify/functions/config.js` acts as a secure bridge. It reads the public-safe `SUPABASE_URL` and `SUPABASE_ANON_KEY` from the environment and sends them to the client-side JavaScript.
*   Your client-side code in `script.js` fetches these keys when the page loads and then initializes Supabase.

This way, your secret keys are never exposed in your public code.

**3.5. Deploy Your Site**

Click **Deploy site**. Netlify will build and deploy your application. Once it's done, you can visit the URL provided by Netlify and your Daily Goal Tracker should be fully functional.
