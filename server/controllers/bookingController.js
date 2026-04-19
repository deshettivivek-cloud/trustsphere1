const supabase = require('../db/supabase')

const createBooking = async (req, res, next) => {
  try {
    const { worker_id, service_type, description, address, scheduled_at } = req.body
    const customer_id = req.user.id

    if (customer_id === worker_id) {
      return res.status(400).json({ success: false, message: "You can't book yourself" })
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert([{ customer_id, worker_id, service_type, description, address, scheduled_at }])
      .select()
      .single()

    if (error) throw error
    res.status(201).json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

const getMyBookings = async (req, res, next) => {
  try {
    const userId = req.user.id

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:profiles!bookings_customer_id_fkey(full_name, phone),
        worker:profiles!bookings_worker_id_fkey(full_name, phone)
      `)
      .or(`customer_id.eq.${userId},worker_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

module.exports = { createBooking, getMyBookings, updateBookingStatus }