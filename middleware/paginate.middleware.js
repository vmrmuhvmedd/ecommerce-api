module.exports = (model) => async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const sortBy = req.query.sort || 'createdAt';
  const order = req.query.order === 'desc' ? -1 : 1;
  const sortObj = { [sortBy]: order };

  try {
    let baseQuery = req.baseQuery || model.find();

    const [data, total] = await Promise.all([
      baseQuery.clone().skip(skip).limit(limit).sort(sortObj).exec(),
      model.countDocuments(baseQuery.getFilter())
    ]);

    const totalPages = Math.ceil(total / limit);

    req.pagination = {
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };

    next();
  } catch (err) {
    console.error('Pagination Middleware Error:', err);
    next(err);
  }
};