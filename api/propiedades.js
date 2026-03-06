import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pntruonwgiotzdslnjgc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBudHJ1b253Z2lvdHpkc2xuamdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwODQ5MTksImV4cCI6MjA4NzY2MDkxOX0.ObqlbfjIeCt3Z15oqDS3l3tRSohzw-hmi5fUX5giVBg';
const supabaseClient = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    try {
        let allData = [];
        let from = 0;
        const step = 1000;
        let hasMore = true;

        while (hasMore) {
            const { data: supaData, error } = await supabaseClient
                .from('propiedades_mdp')
                .select('*')
                .range(from, from + step - 1);
            
            if (error) {
                throw error;
            }
            
            if (supaData && supaData.length > 0) {
                allData = [...allData, ...supaData];
                from += step;
            }
            
            if (!supaData || supaData.length < step) {
                hasMore = false;
            }
        }

        // Configurar caché en Vercel (Edge Cache) por 24 horas (86400 segundos)
        // s-maxage le dice a Vercel que guarde la respuesta en su CDN
        // stale-while-revalidate permite servir datos viejos mientras se actualizan en segundo plano
        res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
        res.status(200).json(allData);
    } catch (error) {
        console.error("Error fetching from Supabase:", error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
}
