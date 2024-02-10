const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const mysql = require('mysql')

const app = express();
const port = 3000 ;

const pool = mysql.createPool({
    host:'localhost',
    user: 'root',
    database: 'user',
    waiForconnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection((err, connection) => {
    if (err){
        console.error('Error connecting to Mysql',err);

    }else {
        console.log('Connected to Mysql')  
     }
});
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(cors());

app.get('/',(req, res)=> {
    res.sendFile(path.join(__dirname, 'sigup.html'));
});

app.post('/register',(req, res )=>{
    const {username, email, password_1, password_2 } = req.body;

    console.log(`Received data: ${JSON.stringify(req.body)}`); 
    
    if(username && email && password_1&& password_2 && password_1===password_2){

    // สร้างคำสั่ง SQL INSERT
    const insertQuery ='INSERT INTO signup (username, email, password) VALUES (?, ?, ?)';
        pool.query(insertQuery, [username, email, password_1 ], (err, result) => {
            if (err) {
                console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ',err)
                 return res.status(500).send('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
            } else {
                console.log('บันทึกข้อมูลลง MySQL สำเร็จ:', result);
                 res.send(`Hello ${username}!!! ${email}! ${password_1}!. ข้อมูลถูกบันทึกลง MySQL แล้ว.`);
            }
            });
        } else if (password_1 !== password_2) {
            res.send(` ERROR รหัสผ่านไม่ตรงกัน `);
        } else {
            res.send(` ERROR ข้อมูลไม่ครบถ้วน `);
        }
});

app.listen(port, ()=>{
    console.log(` Server is running at http://localhost:${port}`);
});
