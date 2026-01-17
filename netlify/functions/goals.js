const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    };

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const path = event.path.replace('/.netlify/functions/goals', '');
        const id = path.replace('/', '') || null;

        switch (event.httpMethod) {
            case 'GET':
                return await getGoals(headers);
            case 'POST':
                return await createGoal(JSON.parse(event.body), headers);
            case 'PUT':
                return await updateGoal(id, JSON.parse(event.body), headers);
            case 'DELETE':
                return await deleteGoal(id, headers);
            default:
                return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
        }
    } catch (error) {
        console.error('Error:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    }
};

async function getGoals(headers) {
    const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('id', { ascending: true });

    if (error) throw error;
    return { statusCode: 200, headers, body: JSON.stringify(data) };
}

async function createGoal(body, headers) {
    const { text } = body;
    if (!text || !text.trim()) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Goal text is required' }) };
    }

    const { data, error } = await supabase
        .from('goals')
        .insert([{ text: text.trim(), completed: false }])
        .select()
        .single();

    if (error) throw error;
    return { statusCode: 201, headers, body: JSON.stringify(data) };
}

async function updateGoal(id, body, headers) {
    if (!id) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Goal ID is required' }) };
    }

    const updates = {};
    if (body.text !== undefined) updates.text = body.text.trim();
    if (body.completed !== undefined) updates.completed = body.completed;

    const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return { statusCode: 200, headers, body: JSON.stringify(data) };
}

async function deleteGoal(id, headers) {
    if (!id) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Goal ID is required' }) };
    }

    const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return { statusCode: 204, headers, body: '' };
}
