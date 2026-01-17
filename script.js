let supabaseClient;

async function initializeSupabase() {
    try {
        const response = await fetch('/.netlify/functions/config');
        const config = await response.json();
        const { supabaseUrl, supabaseAnonKey } = config;
        const { createClient } = supabase;
        supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
        console.error('Failed to initialize Supabase:', error);
    }
}

// --- AUTHENTICATION ---
if (window.location.pathname.includes('auth.html')) {
    const authContainer = document.getElementById('auth-container');
    const authForm = document.getElementById('auth-form');
    const authButton = document.getElementById('auth-button');
    const authSwitch = document.getElementById('auth-switch');
    const authTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const message = document.getElementById('auth-message');

    let isLogin = true;

    function switchAuthMode() {
        isLogin = !isLogin;
        authTitle.textContent = isLogin ? 'Login' : 'Sign Up';
        authSubtitle.textContent = isLogin ? 'Welcome back to your goal tracker' : 'Create an account to start tracking your goals';
        authButton.textContent = isLogin ? 'Login' : 'Sign Up';
        authSwitch.innerHTML = isLogin ? 'Don\'t have an account? <a href="#" onclick="switchAuthMode()">Sign Up</a>' : 'Already have an account? <a href="#" onclick="switchAuthMode()">Login</a>';
        message.textContent = '';
    }
    window.switchAuthMode = switchAuthMode;


    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        message.textContent = '';
        const email = emailInput.value;
        const password = passwordInput.value;

        let response;
        if (isLogin) {
            response = await supabaseClient.auth.signInWithPassword({ email, password });
        } else {
            response = await supabaseClient.auth.signUp({ email, password });
        }

        if (response.error) {
            message.textContent = response.error.message;
        } else {
            window.location.href = '/';
        }
    });
}

// --- APP ---
if (!window.location.pathname.includes('auth.html')) {
    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        window.location.href = '/auth.html';
    });
}


// --- SESSION MANAGEMENT ---
async function checkSession() {
    if (!supabaseClient) {
        await initializeSupabase();
    }
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session && window.location.pathname.includes('auth.html')) {
        window.location.href = '/';
    } else if (!session && !window.location.pathname.includes('auth.html')) {
        window.location.href = '/auth.html';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await initializeSupabase();
    checkSession();
    if (typeof loadGoals === 'function') {
        loadGoals();
    }
});

