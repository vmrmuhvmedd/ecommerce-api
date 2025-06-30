module.exports = (allowedFields = []) => (req, res, next) => {
    const queryObj = {};

    allowedFields.forEach((field) => {
        if (req.query[field]) {
            const value = req.query[field].split(',');
            queryObj[field] = value.length > 1 ? { $in: value } : value[0];
        }
    });

    if (req.query.keyword) {
        queryObj.name = { $regex: req.query.keyword, $options: 'i' };
    }

    if (req.query.stockStatus) {
        if (req.query.stockStatus === 'in') {
            queryObj['variants.stock'] = { $gt: 0 };
        } else if (req.query.stockStatus === 'out') {
            queryObj['variants.stock'] = { $eq: 0 };
        }
    }

    if (req.query.minPrice || req.query.maxPrice) {
        queryObj['variants.price'] = {};
        if (req.query.minPrice) {
            queryObj['variants.price'].$gte = parseFloat(req.query.minPrice);
        }
        if (req.query.maxPrice) {
            queryObj['variants.price'].$lte = parseFloat(req.query.maxPrice);
        }
    }

    req.baseQuery = req.model.find(queryObj);
    next();
};
