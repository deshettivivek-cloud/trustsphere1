const supabase = require('../db/supabase')

// Get all workers (with search/filter) — uses service role key (bypasses RLS)
const getAllWorkers = async (req, res, next) => {
  try {
    const { service, city, search } = req.query

    let query = supabase.from('worker_profiles').select('*')

    if (service) {
      query = query.ilike('service_type', `%${service}%`)
    }

    if (city) {
      query = query.ilike('location', `%${city}%`)
    }

    const { data: wpData, error: wpError } = await query
    if (wpError) throw wpError

    // For each worker, fetch their profile (service key bypasses RLS)
    const merged = await Promise.all(
      (wpData || []).map(async (wp) => {
        const { data: prof } = await supabase
          .from('profiles')
          .select('full_name, city, email, phone, role')
          .eq('id', wp.user_id)
          .maybeSingle()

        return {
          id: wp.id,
          user_id: wp.user_id,
          service_type: wp.service_type,
          location: wp.location,
          created_at: wp.created_at,
          full_name: prof?.full_name || 'Unknown',
          city: prof?.city || wp.location || 'Not specified',
          email: prof?.email || '',
          phone: prof?.phone || '',
        }
      })
    )

    // Filter by search term if provided
    let results = merged
    if (search) {
      const s = search.toLowerCase()
      results = merged.filter(w =>
        w.service_type?.toLowerCase().includes(s) ||
        w.full_name?.toLowerCase().includes(s) ||
        w.city?.toLowerCase().includes(s)
      )
    }

    res.json({ success: true, data: results })
  } catch (err) {
    next(err)
  }
}

// Get single worker by user id
const getWorkerById = async (req, res, next) => {
  try {
    const { id } = req.params

    const { data: wp, error } = await supabase
      .from('worker_profiles')
      .select('*')
      .eq('user_id', id)
      .single()

    if (error) throw error
    if (!wp) return res.status(404).json({ success: false, message: 'Worker not found' })

    // Get profile
    const { data: prof } = await supabase
      .from('profiles')
      .select('full_name, email, phone, city, role')
      .eq('id', id)
      .maybeSingle()

    // Get reviews (ignore error if table doesn't exist)
    let reviews = []
    try {
      const { data: reviewData } = await supabase
        .from('reviews')
        .select('*')
        .eq('worker_id', id)
        .order('created_at', { ascending: false })
      if (reviewData) reviews = reviewData
    } catch (_) {}

    res.json({
      success: true,
      data: {
        ...wp,
        full_name: prof?.full_name || 'Unknown',
        email: prof?.email || '',
        phone: prof?.phone || '',
        city: prof?.city || wp.location || '',
        reviews,
      }
    })
  } catch (err) {
    next(err)
  }
}

// Update worker profile
const updateWorkerProfile = async (req, res, next) => {
  try {
    const { service_type, location } = req.body

    const update = {}
    if (service_type) update.service_type = service_type
    if (location) update.location = location

    const { data, error } = await supabase
      .from('worker_profiles')
      .update(update)
      .eq('user_id', req.user.id)
      .select()
      .single()

    if (error) throw error
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

// Toggle availability
const toggleAvailability = async (req, res, next) => {
  try {
    const { is_available } = req.body

    const { data, error } = await supabase
      .from('worker_profiles')
      .update({ is_available })
      .eq('user_id', req.user.id)
      .select()
      .single()

    if (error) throw error
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getAllWorkers,
  getWorkerById,
  updateWorkerProfile,
  toggleAvailability
}