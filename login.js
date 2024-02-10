const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const port= 3000;

const pool = mysql.createPool({
    host:'localhost',
    user: 'root',
    database: 'user',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.get('/',(req, res)=> {
    res.sendFile(path.join(__dirname, 'login.html'));
});


app.post('/login', (req, res) => {
    const { username, password } = req.body;

    console.log(Received data: ${JSON.stringify(req.body)});

    if (username && password) {
        const selectQuery = 'SELECT * FROM signup WHERE username = ? AND password = ?';
        pool.query(selectQuery, [username, password], (err, result) => {

            if (err) {
                console.error('ไม่พบข้อมูลในระบบ', err);
                return res.status(500).send('ไม่พบข้อมูลในระบบ');
            } else {
                if (result.length > 0) {
                      console.log('เข้าสู่ระบบสำเร็จ:', result);

                    // เพิ่มข้อมูลเข้าในตาราง login
                    const { username, email, password } = result[0];
                    const insertQuery = 'INSERT INTO login (username, password) VALUES (?, ?)';
                    pool.query(insertQuery, [username,password], (err, result) => {
                        if (err) {
                            console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ', err);
                            return res.status(500).send('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
                        } else {
                            console.log('บันทึกข้อมูลลงในตาราง mysql สำเร็จ:', result);
                            res.send(<p>เข้าสู่ระบบสำเร็จ ยินดีต้อนรับ !</p>);
                        }
                    });
                } else {
                    res.send('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
                }
            }
        });
    } else {
        res.send('ERROR ข้อมูลไม่ครบถ้วน');
    }
});

app.listen(port, ()=>{
    console.log( Server is running at http://localhost:${port});
});