# MusicProjectWithViet

API server cho ứng dụng nghe nhạc, xây dựng với Node.js, Express, TypeScript và MongoDB (Mongoose). Dự án hỗ trợ đề xuất nhạc (recommendation), quản lý bài hát, album, playlist, người dùng, và các API tìm kiếm.

## Công nghệ chính
- Node.js, Express 
- TypeScript, zod
- MongoDB, Mongoose
- multer, cloudinary, JWT

```

## Thiết lập môi trường
Tạo file `.env` ở thư mục gốc:
```
NODE_ENV = 

PORT = 
CORS_ORIGIN = 
MONGO_URL = 

CLOUD_NAME = 
CLOUD_KEY = 
CLOUD_SECRET = 

ACCESS_TOKEN_SECRET =
ACCESS_TOKEN_SECRET_EXPIRE = 
REFRESH_TOKEN_SECRET =
REFRESH_TOKEN_SECRET_EXPIRE = 
COOKIE_HTTP_ONLY_EXPIRE = 

```

## Cài đặt & chạy
```bash
# Cài dependencies
npm install

# Chạy dev (nodemon)
npm run start

# Kiểm tra kiểu TypeScript
npm run ts.check

# Build TypeScript -> dist
npm run build
```
Server chạy tại `http://localhost:${PORT}`.


