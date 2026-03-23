// 主入口文件
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const userRouter = require('./router/userRouter')
const errorHandler  = require('./middleware/errorHandler')
const app = express()
// 允许跨域
app.use(cors())
// 解析json
app.use(express.json())
app.use('/api/users', userRouter) 
// 错误处理中间件，置于所有路由之后
app.use(errorHandler)
const PORT = 3000
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})

module.exports = app
