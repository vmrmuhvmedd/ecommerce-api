const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Brand = require('../models/brand.model');
const Category = require('../models/category.model');

module.exports = (allowedFields = []) => async (req, res, next) => {
    const queryObj = {};

    try {
        for (const field of allowedFields) {
            if (req.query[field]) {
                let valueArr = req.query[field].split(',');

                if (field === 'brand') {
                    const brandIds = [];
                    for (const val of valueArr) {
                        if (ObjectId.isValid(val)) {
                            brandIds.push(val);
                        } else {
                            const brandDoc = await Brand.findOne({ slug: val }).select('_id');
                            if (brandDoc) brandIds.push(brandDoc._id);
                        }
                    }
                    if (brandIds.length > 0) {
                        queryObj[field] = brandIds.length > 1 ? { $in: brandIds } : brandIds[0];
                    }
                }

                else if (field === 'category') {
                    const categoryIds = [];
                    for (const val of valueArr) {
                        if (ObjectId.isValid(val)) {
                            categoryIds.push(val);
                        } else {
                            const categoryDoc = await Category.findOne({ slug: val }).select('_id');
                            if (categoryDoc) categoryIds.push(categoryDoc._id);
                        }
                    }
                    if (categoryIds.length > 0) {
                        queryObj[field] = categoryIds.length > 1 ? { $in: categoryIds } : categoryIds[0];
                    }
                }

                else {
                    valueArr = valueArr.map(v => (ObjectId.isValid(v) ? new ObjectId(v) : v));
                    queryObj[field] = valueArr.length > 1 ? { $in: valueArr } : valueArr[0];
                }
            }
        }

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
    } catch (err) {
        console.error('Filter Middleware Error:', err);
        next(err);
    }
};
