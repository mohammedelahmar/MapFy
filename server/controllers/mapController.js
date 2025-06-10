const Map = require('../models/Map');

// Get all maps for the current user
exports.getMaps = async (req, res) => {
  try {
    const maps = await Map.find({ user: req.user.id })
      .sort({ updatedAt: -1 });
    
    res.json(maps);
  } catch (err) {
    console.error('Error in getMaps:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific map by ID
exports.getMapById = async (req, res) => {
  try {
    const map = await Map.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!map) {
      return res.status(404).json({ message: 'Map not found' });
    }
    
    res.json(map);
  } catch (err) {
    console.error('Error in getMapById:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new map
exports.createMap = async (req, res) => {
  try {
    const { name, description, geojson, style, center, zoom, isDraft } = req.body;
    
    const newMap = new Map({
      user: req.user.id,
      name,
      description,
      geojson,
      style,
      center: center || { lng: -70.9, lat: 42.35 },
      zoom: zoom || 9,
      isDraft: isDraft || false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const savedMap = await newMap.save();
    res.json(savedMap);
  } catch (err) {
    console.error('Error in createMap:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update an existing map
exports.updateMap = async (req, res) => {
  try {
    const { name, description, geojson, style, center, zoom, isDraft } = req.body;
    
    const map = await Map.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!map) {
      return res.status(404).json({ message: 'Map not found' });
    }
    
    if (name) map.name = name;
    if (description !== undefined) map.description = description;
    if (geojson) map.geojson = geojson;
    if (style) map.style = style;
    if (center) map.center = center;
    if (zoom) map.zoom = zoom;
    if (isDraft !== undefined) map.isDraft = isDraft;
    map.updatedAt = new Date();
    
    const updatedMap = await map.save();
    res.json(updatedMap);
  } catch (err) {
    console.error('Error in updateMap:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a map
exports.deleteMap = async (req, res) => {
  try {
    const map = await Map.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!map) {
      return res.status(404).json({ message: 'Map not found' });
    }
    
    await Map.deleteOne({ _id: req.params.id });
    res.json({ message: 'Map deleted' });
  } catch (err) {
    console.error('Error in deleteMap:', err);
    res.status(500).json({ message: 'Server error' });
  }
};