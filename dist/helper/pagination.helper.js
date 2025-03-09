"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (currentPage, limit, total) => {
    const objectPagination = {
        page: currentPage,
        limit: limit,
    };
    objectPagination["skip"] = (currentPage - 1) * limit;
    objectPagination["totalPage"] = Math.ceil(total / limit);
    return objectPagination;
};
