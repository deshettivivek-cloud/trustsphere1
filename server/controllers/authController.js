const supabase = require('../db/supabase')

const createProfile = async (req, res, next) => {
  try {
    const { full_name, phone, role, city } = req.body
    const userId = req.user.id
    const email = req.user.email

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (existing) {
      return res.status(200).json({ success: true, message: 'Profile already exists' })
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert([{ id: userId, full_name, email, phone, role, city }])
      .select()
      .single()

    if (error) throw error
    res.status(201).json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

const getMyProfile = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single()

    if (error) throw error
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

module.exports = { createProfile, getMyProfile }