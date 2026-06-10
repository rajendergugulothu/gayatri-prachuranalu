// Vercel serverless function — returns a short-lived signed URL for a book PDF,
// but ONLY to a signed-in (Firebase) user. This is what keeps the Supabase bucket private
// while the site authenticates with Firebase.
//
// Required Vercel env vars (Project Settings -> Environment Variables):
//   SUPABASE_URL                = https://btkukllszsqmjbpuzsde.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY   = Supabase -> Project Settings -> API -> service_role  (SECRET)
//   FIREBASE_SERVICE_ACCOUNT    = Firebase -> Project settings -> Service accounts -> Generate key
//                                 (paste the entire JSON as the value)

const admin = require('firebase-admin');
const { createClient } = require('@supabase/supabase-js');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
  });
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

module.exports = async (req, res) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) return res.status(401).json({ error: 'sign-in required' });

    // Throws unless this is a valid, current Firebase login.
    await admin.auth().verifyIdToken(token);

    const id = String(req.query.id || '');
    if (!/^[a-z0-9-]+$/.test(id)) return res.status(400).json({ error: 'bad id' });

    const { data, error } = await supabase
      .storage.from('Books')
      .createSignedUrl(`${id}.pdf`, 60); // 60-second link
    if (error || !data) return res.status(404).json({ error: 'not found' });

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ url: data.signedUrl });
  } catch (e) {
    return res.status(401).json({ error: 'unauthorized' });
  }
};
