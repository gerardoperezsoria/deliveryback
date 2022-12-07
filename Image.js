const express = require('express')
const fileUpload = require('express-fileupload')

const app = express()

app.use(fileUpload())

app.post('/upload',(req,res) => {
    let EDFile = req.body
    console.log(req)
    // EDFile.mv(`./uploads/videos/${EDFile.name}`,err => {
    //     if(err) return res.status(500).send({ message : err })

    //     return res.status(200).send({ message : 'File upload' })
    // })
})

app.listen(9000,() => console.log('Corriendo'))