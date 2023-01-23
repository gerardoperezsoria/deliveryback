var express = require("express");
var multer = require('multer');
var http = require('http');
var https = require('https');
const ipstack = require('ipstack')
var fs = require('fs');
var util = require('util');
const cors = require('cors')
// const fileUpload = require('express-fileupload')
const { v4: uuid } = require('uuid');
var bodyParser = require('body-parser');
const path = require('path');
var app = express();
var fetch = require("node-fetch")

app.use(cors())
// app.use(fileUpload())
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    extended: true
}));
// Certificate
const privateKey = fs.readFileSync('/etc/letsencrypt/live/lodashy.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/lodashy.com/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/lodashy.com/chain.pem', 'utf8');

const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};

//Mysql 
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '!A1c3e5g7',
    database: 'carrery'
});

function fechaActual() {
    var hoy = new Date();
    var fecha = hoy.getFullYear() + '-' + (hoy.getMonth() + 1) + '-' + hoy.getDate();
    var hora = hoy.getHours() + ':' + hoy.getMinutes() + ':' + hoy.getSeconds();
    var fechaYHora = fecha + ' ' + hora;
    return fechaYHora
}

async function sendNotificationWhatsApp(message, phone) {
    try {
        const data = {
            "message": `${message}`,
            "phone": `521${phone}`
        }
        const url = "http://localhost:3001/lead"
        const response = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            body: JSON.stringify(data)
        });
        const respuesta = await response.json()
        console.log(respuesta)
    } catch (error) {
        console.log(error)
    }
}

let dias = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
let meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
function getDiaActual() {
    let date = new Date();
    let fechaNum = date.getUTCDate();
    let mes_name = date.getMonth();
    // alert(dias[date.getDay()] + " " + fechaNum + " de " + meses[mes_name] + " de " + date.getFullYear());
    return dias[date.getDay()]
}

function updatStatusDelivery(idrepartidor, status) {
    connection.query(`UPDATE statusdelivery SET status=? WHERE idrepartidor=?`, [status, idrepartidor], function (error, results, fields) {
        if (error) throw error;
        console.log("update status rider sucess!")
    });
}

var async = require('async');
// ipstack {
//     ip: '177.242.220.135',
//     type: 'ipv4',
//     continent_code: 'NA',
//     continent_name: 'North America',
//     country_code: 'MX',
//     country_name: 'Mexico',
//     region_code: 'MIC',
//     region_name: 'Michoacán',
//     city: 'Heróica Zitácuaro',
//     zip: '61508',
//     latitude: 19.438079833984375,
//     longitude: -100.34561920166016,
//     location: {
//       geoname_id: 4004885,
//       capital: 'Mexico City',
//       languages: [ [Object] ],
//       country_flag: 'https://assets.ipstack.com/flags/mx.svg',
//       country_flag_emoji: '🇲🇽',
//       country_flag_emoji_unicode: 'U+1F1F2 U+1F1FD',
//       calling_code: '52',
//       is_eu: false
//     }
//   }  

app.get('/api/getcountry/:ippublica', function (req, res) {
    const { ippublica } = req.params
    ipstack(ippublica, "8d3f310fb7d007000e4397addaa5c975", (err, response) => {
        // res.json({ code_country: response.country_code, zip: response.zip });
        res.json(response);
        res.end();
    })
    // connection.query(`SELECT * FROM statusdelivery where idrepartidor=?`, [idrepartidor], function (error, results, fields) {
    //     if (error) throw error;
    //     if (results.length > 0) {
    //         res.json(results);
    //     } else {
    //         res.json([]);
    //     }
    //     res.end();
    // });
});

app.post('/api/authenticationshoper', function (req, res) {
    const { password, telefono, status } = req.body
    connection.query(`SELECT idusuario FROM usuario where password=? and telefono=? and status=?`, [password, telefono, status], function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
            const { idusuario } = results[0]
            connection.query(`SELECT idshoper FROM shoper where idusuario=?`,
                [idusuario], function (error, resultstienda, fields) {
                    if (error) throw error;
                    if (resultstienda.length > 0) {
                        res.json(resultstienda);
                    } else {
                        res.json([]);
                    }
                    res.end();
                });
        } else {
            res.json([]);
        }
        // res.end();
    });
});

app.post('/api/authenticationcustomer', function (req, res) {
    const { password, telefono, status } = req.body
    connection.query(`SELECT idusuario FROM usuario where password=? and telefono=? and status=?`, [password, telefono, status], function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
            const { idusuario } = results[0]
            connection.query(`SELECT idtienda FROM tienda where idusuario=?`,
                [idusuario], function (error, resultstienda, fields) {
                    if (error) throw error;
                    if (resultstienda.length > 0) {
                        res.json(resultstienda);
                    } else {
                        res.json([]);
                    }
                    res.end();
                });
        } else {
            res.json([]);
        }
        // res.end();
    });
});

app.post('/api/authenticationdelivery', function (req, res) {
    const { password, telefono, status } = req.body
    connection.query(`SELECT idusuario FROM usuario where password=? and telefono=? and status=?`, [password, telefono, status], function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
            console.log("results I", results[0])
            // res.json(results);
            const { idusuario } = results[0]
            connection.query(`SELECT idrepartidor FROM repartidor where idusuario=?`,
                [idusuario], function (error, resultstienda, fields) {
                    console.log("results II", resultstienda)
                    if (error) throw error;
                    if (resultstienda.length > 0) {
                        res.json(resultstienda);
                    } else {
                        res.json([]);
                    }
                    res.end();
                });
        } else {
            res.json([]);
        }
        // res.end();
    });
});


app.post('/api/changestatuscustomer', function (req, res) {
    const { idtienda, status } = req.body
    let estatus = 0;
    if (status === "1" || status === 1) {
        estatus = 0
    }
    if (status === "0" || status === 0) {
        estatus = 1
    }
    connection.query(`UPDATE statustienda SET status=? WHERE idtienda=?`, [estatus, idtienda], function (error, results, fields) {
        if (error) throw error;
        res.json(estatus);
        res.end();
    });
});

function changeStatusPedido(estatus, tiendaID) {
    connection.query(`UPDATE pedido SET autoservicio=? WHERE idtienda=?`, [estatus, tiendaID], function (error, results, fields) {
        if (error) throw error;
        console.log("changeStatusPedido", results)
    });
}

app.post('/api/changestatuscustomerautoservicio', function (req, res) {
    const { idtienda, statusauto } = req.body
    let estatus = 0;
    if (statusauto === "0" || statusauto === 0) {
        estatus = 1
    }
    if (statusauto === "1" || statusauto === 1) {
        estatus = 0
    }
    connection.query(`UPDATE statustienda SET autoservicio=? WHERE idtienda=?`, [estatus, idtienda], function (error, results, fields) {
        if (error) throw error;
        res.json(estatus);
        changeStatusPedido(estatus, idtienda)
        res.end();
    });
});

app.post('/api/changestatusdelivery', function (req, res) {
    const { idrepartidor, status } = req.body
    console.log("body", idrepartidor, status)
    connection.query(`UPDATE statusdelivery SET status=? WHERE idrepartidor=?`, [!status, idrepartidor], function (error, results, fields) {
        if (error) throw error;
        res.json(!status);
        res.end();
    });
});


app.get('/api/consultaestatusdelivery/:idrepartidor', function (req, res) {
    const { idrepartidor } = req.params
    connection.query(`SELECT * FROM statusdelivery where idrepartidor=?`, [idrepartidor], function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
            res.json(results);
        } else {
            res.json([]);
        }
        res.end();
    });
});

app.get('/api/consultaestatuscustomerautoservicio/:idtienda', function (req, res) {
    const { idtienda } = req.params
    connection.query(`SELECT * FROM statustienda where idtienda=?`, [idtienda], function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
            res.json(results);
        } else {
            res.json([]);
        }
        res.end();
    });
});

app.get('/api/consultaestatuscustomer/:idtienda', function (req, res) {
    const { idtienda } = req.params
    connection.query(`SELECT * FROM statustienda where idtienda=?`, [idtienda], function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
            res.json(results);
        } else {
            res.json([]);
        }
        res.end();
    });
});

/**Valida si se usa este metodo */
app.get('/api/pedidoscustomer/:idtienda', function (req, res) {
    const { idtienda } = req.params
    connection.query(`SELECT * FROM pedido where idtienda=? and status=1 and status_tienda=""`, [idtienda], function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
            res.json(results);
        } else {
            res.json([]);
        }
        res.end();
    });
});

app.get('/api/pedidoscustomerentransito/:idtienda', function (req, res) {
    const { idtienda } = req.params
    // connection.query('SELECT * FROM productos WHERE username = ? AND password = ?', [username, password], function (error, results, fields) {
    connection.query(`SELECT * FROM pedido where idtienda=? and status=2`, [idtienda], function (error, results, fields) {
        if (error) throw error;
        console.log("pedidoscustomer", results)
        if (results.length > 0) {
            res.json(results);
        } else {
            res.json([]);
        }
        res.end();
    });
});

/**Se cambio llamado a pedido, validar si se usa en el futuro */
app.get('/api/ventas', function (req, res) {
    connection.query(`SELECT * FROM venta where status=1 ORDER BY idventa DESC`, [], function (error, results, fields) {
        if (error) throw error;
        console.log("results", results)
        if (results.length > 0) {
            res.json(results);
        } else {
            res.json([]);
        }
        res.end();
    });
});


app.get('/api/productos/:limite/:zona', function (req, res) {
    const { limite, zona } = req.params
    // const diasemana = getDiaActual()
    connection.query(`SELECT 
        precioenvio.precioenvio,
        statustienda.autoservicio,

        producto.status, 
        horario.hora_apertura as hora_apertura_horario,horario.hora_cierre as hora_cierre_horario,
        horario.status_dia as status_dia_horario,statustienda.status as statustienda, producto.nombre, 
        producto.descripcion, producto.fotos, producto.precio, producto.idproducto, producto.idtienda, 
        producto.envio, tienda.hora_apertura, tienda.logotipo, tienda.hora_cierre, tienda.nombre_tienda
        FROM tienda
        INNER JOIN producto
        ON tienda.idtienda=producto.idtienda
        INNER JOIN statustienda
        ON statustienda.idtienda=producto.idtienda
        INNER JOIN horario
        ON horario.idtienda=producto.idtienda
        INNER JOIN usuario
        ON usuario.idusuario=tienda.idusuario
        LEFT JOIN precioenvio
        ON tienda.idtienda=precioenvio.idtienda

        WHERE producto.status=1 
        and usuario.cp like '${zona}%'
        and horario.status_dia=1 
        and horario.dia=(select case DATE_FORMAT(curdate(),'%w') when 1 then 'LUNES' 
                                                                 WHEN 2 THEN 'MARTES' 
                                                                 WHEN 3 THEN 'MIERCOLES' 
                                                                 WHEN 4 THEN 'JUEVES' 
                                                                 WHEN 5 THEN 'VIERNES' 
                                                                 WHEN 6 THEN 'SABADO' 
                                                                 WHEN 0 THEN 'DOMINGO' 
                                                                 END) 
        and horario.status_dia=1 limit ${limite}`, [], function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
            res.json(results);
        } else {
            res.json([]);
        }
        res.end();
    });
});

/**Solo cambia que se busca por idtienda fucionar con /api/producto en el futuro */
app.get('/api/tiendas/:idtienda/:limite', function (req, res) {
    const { idtienda, limite } = req.params
    const diasemana = getDiaActual()
    
    console.log("query",`SELECT horario.hora_apertura as hora_apertura_horario, 
    horario.hora_cierre as hora_cierre_horario,horario.status_dia as status_dia_horario,
    statustienda.status as statustienda, producto.nombre, producto.descripcion, producto.fotos, 
    producto.precio, producto.idproducto, producto.idtienda, producto.envio, tienda.hora_apertura, 
    tienda.logotipo, tienda.hora_cierre, tienda.nombre_tienda
    FROM tienda
    INNER JOIN producto
    ON tienda.idtienda=producto.idtienda
    INNER JOIN statustienda
    ON statustienda.idtienda=producto.idtienda
    INNER JOIN horario
    ON horario.idtienda=producto.idtienda
    WHERE producto.idtienda=${idtienda} and producto.status=1 
    and horario.status_dia=1 and horario.dia=${diasemana} and horario.status_dia=1 
    limit 50`)
    connection.query(`SELECT horario.hora_apertura as hora_apertura_horario, 
        horario.hora_cierre as hora_cierre_horario,horario.status_dia as status_dia_horario,
        statustienda.status as statustienda, producto.nombre, producto.descripcion, producto.fotos, 
        producto.precio, producto.idproducto, producto.idtienda, producto.envio, tienda.hora_apertura, 
        tienda.logotipo, tienda.hora_cierre, tienda.nombre_tienda
        FROM tienda
        INNER JOIN producto
        ON tienda.idtienda=producto.idtienda
        INNER JOIN statustienda
        ON statustienda.idtienda=producto.idtienda
        INNER JOIN horario
        ON horario.idtienda=producto.idtienda
        WHERE producto.idtienda=? and producto.status=1 
        and horario.status_dia=1 and horario.dia=? and horario.status_dia=1 
        limit ${limite}`, [idtienda, diasemana], function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
            res.json(results);
        } else {
            res.json([]);
        }
        res.end();
    });
});


app.get('/api/productoportienda/:idtienda/:limite', function (req, res) {
    const { idtienda, limite = 1 } = req.params
    // connection.query('SELECT * FROM productos WHERE username = ? AND password = ?', [username, password], function (error, results, fields) {
    connection.query(`SELECT * FROM producto WHERE idtienda=? and status=1 ORDER BY idproducto DESC limit ${limite}`,
        [idtienda, limite], function (error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {
                res.json(results);
            } else {
                res.json([]);
            }
            res.end();
        });
});

app.get('/api/allproductshop/:idtienda', function (req, res) {
    const { idtienda, limite = 1 } = req.params
    connection.query(`SELECT * FROM producto WHERE idtienda=?`,
        [idtienda, limite], function (error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {
                res.json(results);
            } else {
                res.json([]);
            }
            res.end();
        });
});

// app.get('/api/productoportienda/:idtienda/:cantidad/:status', function (req, res) {
//     const { idtienda, cantidad, status } = req.params
//     connection.query(`SELECT * FROM producto WHERE status=? and idtienda=? ORDER BY idproducto DESC limit ${cantidad}`, [status, idtienda], function (error, results, fields) {
//         if (error) throw error;
//         if (results.length > 0) {
//             res.json(results);
//         } else {
//             res.json([]);
//         }
//         res.end();
//     });
// });

app.get('/api/todoslospedidosportienda/:idtienda', function (req, res) {
    const { idtienda } = req.params
    connection.query(`SELECT * FROM pedido WHERE idtienda=? and status_repartidor="" and idrepartidor=0 and autoservicio=0 and status_tienda=2 and status=1`,
        [idtienda], function (error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {
                res.json(results);
            } else {
                res.json([]);
            }
            res.end();
        });
});

app.post('/api/updateproductforshop', function (req, res) {
    const { idtienda, status } = req.body
    connection.query(`UPDATE producto SET status=? WHERE idtienda=?`, [status, idtienda], function (error, results, fields) {
        if (error) throw error;
        if (results.affectedRows > 0) {
            res.json({ results });
        } else {
            res.json([]);
        }
        res.end();
    });
});

app.post('/api/updatenvioproducto', function (req, res) {
    const { idtienda, status } = req.body
    let estatus = status
    if (status) {
        estatus = 1
    }
    if (!status) {
        estatus = 0
    }
    connection.query(`UPDATE producto SET envio=? WHERE idtienda=?`, [estatus, idtienda], function (error, results, fields) {
        if (error) throw error;
        if (results.affectedRows > 0) {
            if (status) {
                estatus = 1
            }
            if (!status) {
                estatus = 0
            }
            res.json({ status: estatus });
        } else {
            res.json([]);
        }
        res.end();
    });
});

app.post('/api/completarpedido', function (req, res) {
    const { id, status } = req.body
    connection.query(`UPDATE venta SET status_repartidor=? where idventa=?`, [status, id], function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
            res.json(results);
        } else {
            res.json([]);
        }
        res.end();
    });
});

app.post('/api/completarpedidocustomer', function (req, res) {
    const { idtienda, status_tienda, idventa } = req.body
    connection.query(`UPDATE pedido SET status_tienda=? where idventa=? and idtienda=? and status=1`,
        [status_tienda, idventa, idtienda], function (error, results, fields) {
            if (error) throw error;
            if (results.affectedRows > 0) {
                connection.query(`UPDATE pedido SET status=2 where status=1 and status_repartidor = 2 and status_tienda = 2 and idventa=?`,
                    [idventa], function (error, resultsupdate, fields) {
                        if (error) throw error;
                        if (resultsupdate.affectedRows > 0) {
                            res.json({ result: "OK" });
                        } else {
                            res.json([]);
                        }
                        res.end();
                    });
            } else {
                res.json({ result: "OK" });
            }
            // res.end();
        });
});
/**Se migra a function */
app.post('/api/pedido', function (req, res) {
    const { idventa, idrepartidor, idtienda = 0 } = req.body
    connection.query(`INSERT INTO pedido VALUES(null,?,?,?,"",'${fechaActual()}',?,?,1)`,
        [idventa, idrepartidor, idtienda, status_repartidor = 1, status_tienda = ""], function (error, results, fields) {
            if (error) throw error;
            if (results.affectedRows > 0) {
                connection.query(`UPDATE venta SET status=2 WHERE idventa=? and status=1`,
                    [idventa], function (error, results, fields) {
                        if (error) throw error;
                        if (results.affectedRows > 0) {
                            res.json({ result: "OK" });
                        } else {
                            res.json([]);
                        }
                        res.end();
                    });

            } else {
                res.json([]);
            }
            // res.end();
        });
});

app.post('/api/pedidoupdate', function (req, res) {
    const { idventa, idrepartidor, idtienda, status_repartidor } = req.body
    connection.query(`UPDATE pedido SET idRepartidor=?, status_repartidor=? where idventa=? and idtienda=? and status=1`,
        [idrepartidor, status_repartidor, idventa, idtienda], function (error, results, fields) {
            if (error) throw error;
            if (results.affectedRows > 0) {
                if (status_repartidor === 1) {
                    res.json({ result: "OK" });
                    updatStatusDelivery(idrepartidor, 2)
                    res.end();
                }
                if (status_repartidor === 2) {
                    connection.query(`UPDATE pedido SET status=2 where status=1 and status_repartidor = 2 and status_tienda = 2 and idventa=?`,
                        [idventa], function (error, resultsupdate, fields) {
                            if (error) throw error;
                            if (resultsupdate.affectedRows > 0) {
                                res.json({ result: "OK" });
                                updatStatusDelivery(idrepartidor, 1)
                            } else {
                                res.json([]);
                            }
                            res.end();
                        });
                }
            } else {
                res.json({ result: [] });
            }
        });
});

app.get('/api/todoslospedidos/:status', function (req, res) {
    const { status } = req.params
    connection.query(`SELECT * from pedido where status_repartidor="" and idrepartidor=0 and autoservicio=? and status=1`,
        [parseInt(status)], function (error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {
                res.json(results);
            } else {
                res.json([]);
            }
            res.end();
        });
});

app.get('/api/detalleproducto/:idventa/:idtienda', function (req, res) {
    const { idventa, idtienda } = req.params
    connection.query(`SELECT pedido.notas, pedido.telefono as telefono_cliente, tienda.nombre_tienda, producto.nombre, producto.fotos, producto.descripcion, 
    usuario.nombre as nombre_negocio, usuario.calle as calle_negocio, usuario.numero as numero_negocio, usuario.colonia as colonia_negocio, usuario.cp as cp_negocio, 
    usuario.ciudad as ciudad_negocio, usuario.telefono as telefono_negocio, 
    usuario.entre_calles as entre_calles_negocio,
    venta.cantidad, venta.direccion, venta.colonia, venta.estado, venta.ciudad, venta.pais, venta.cp, venta.nombre 
    FROM venta
    INNER JOIN producto
    ON venta.idproducto=producto.idproducto
    INNER JOIN tienda
    ON tienda.idtienda=producto.idtienda
    INNER JOIN usuario
    ON tienda.idusuario=usuario.idusuario

    INNER JOIN pedido
    ON venta.idventa=pedido.idventa

    WHERE venta.idventa=?`,
        [idventa], function (error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {
                res.json(results);
            } else {
                res.json([]);
            }
            res.end();
        });
});

app.get('/api/pedido/:idrepartidor/:idtienda/:idventa', function (req, res) {
    const { idrepartidor, idtienda, idventa } = req.params
    console.log("pedido", idrepartidor > 0, idtienda === "null", idventa === "null", idventa, idtienda)
    if (idrepartidor > 0 & idtienda === "null" & idventa === "null") {
        connection.query(`SELECT * from pedido where idrepartidor=${idrepartidor} and status=1`,
            [idtienda, idventa], function (error, results, fields) {
                console.log("results pedido I", results)
                if (error) throw error;
                if (results.length > 0) {
                    res.json({ result: results });
                    res.end();
                } else {
                    res.json({ result: [] });
                    res.end();
                }
            });
    }
    if (idtienda > 0 & idventa > 0) {
        connection.query(`SELECT * from pedido where idtienda=? and idventa=?`,
            [idtienda, idventa], function (error, results, fields) {
                console.log("results pedido II", results)
                if (error) throw error;
                if (results.length > 0) {
                    res.json({ result: results });
                    res.end();
                } else {
                    res.json({ result: [] });
                    res.end();
                }
            });
    }
});

app.get('/api/statusentrega/:numrastreo', function (req, res) {
    const { numrastreo } = req.params
    connection.query(`SELECT * from pedido where idventa=${numrastreo}`,
        [], function (error, resultspedido, fields) {
            if (error) throw error;
            if (resultspedido.length > 0) {
                res.json({ rastreo: resultspedido });
            } else {
                res.json({ rastreo: [] });
                // connection.query(`SELECT * from venta where idventa=${numrastreo}`,
                //     [], function (error, resultsventa, fields) {
                //         if (error) throw error;
                //         console.log("resultsventa", resultsventa)
                //         if (resultsventa.length > 0) {
                //             res.json({ rastreo: resultsventa });
                //         } else {
                //             res.json({ rastreo: 0 });
                //         }
                //         res.end();
                //     });
            }
            res.end();
        });
});

app.post('/api/venta', function (req, res) {
    const { idproducto, cantidad, idtienda, descripcion,
        direccion,
        colonia,
        estado,
        ciudad,
        pais,
        cp,
        nombre, notas, telefono
    } = req.body
    connection.query(`INSERT INTO venta VALUES(null,?,?,?,?,?,?,?,?,?,?,'${fechaActual()}',1)`,
        [idproducto, cantidad, idtienda, direccion, colonia, estado, ciudad, pais, cp, nombre], function (error, results, fields) {
            if (error) throw error;
            if (results.affectedRows > 0) {
                res.json({ insertId: results.insertId });
                insertPedido(results.insertId, 0, idtienda, "", "", "", notas, telefono)
            } else {
                res.json([]);
            }
            res.end();
        });
});

function statusTienda(idtienda) {
    connection.query(`INSERT INTO statustienda VALUES(null,'${fechaActual()}',?,1,1)`,
        [idtienda], function (error, results, fields) {
            if (error) throw error;
            console.log("results", results)
        });
}

function insertHorario(idtienda, horario) {
    const objhorario = JSON.parse(horario)
    objhorario.map((row, index) => {
        const diadescanzo = row.descanzo
        let descanzo = 0
        if (diadescanzo) {
            descanzo = 1
        }
        if (!diadescanzo) {
            descanzo = 0
        }

        connection.query(`INSERT INTO horario VALUES(null,?,?,?,?,?,1)`,
            [row.dia, row.hora_apertura, row.hora_cierre, descanzo, idtienda], function (error, results, fields) {
                if (error) throw error;
                console.log("insert horario correct", index)
            });
    })

}

function statusDelivery(idrepartidor) {
    connection.query(`INSERT INTO statusdelivery VALUES(null,?,'${fechaActual()}',1,0)`,
        [idrepartidor], function (error, results, fields) {
            if (error) throw error;
            console.log("results", results)
        });
}

function insertPedido(idventa, idrepartidor, idtienda, hora_entrega = "", status_repartidor = "", status_tienda = "", notas, telefono) {
    connection.query(`SELECT * FROM statustienda where idtienda=?`,
        [idtienda], function (error, resultsstatustienda, fields) {
            if (error) throw error;
            const statusautoservicio = resultsstatustienda[0].autoservicio
            connection.query(`INSERT INTO pedido VALUES(null,?,?,?,?,'${fechaActual()}',?,?,?,?,?,1)`,
                [idventa, idrepartidor, idtienda, hora_entrega, status_repartidor, status_tienda, statusautoservicio, notas, telefono], function (error, results, fields) {
                    if (error) throw error;

                    connection.query(`SELECT * FROM suscriptor where idtienda=?`,
                        [idtienda], function (error, suscriptor, fields) {
                            if (error) throw error;
                            const subscription = {
                                endpoint: suscriptor[0].endpoint,
                                expirationTime: 500,
                                keys: {
                                    p256dh: suscriptor[0].p256dh,
                                    auth: suscriptor[0].auth
                                }
                            }
                            const payload = JSON.stringify({ title: 'Hola tienes un pedido desde carrery, entra a carrery.com/customer y prepara el pedido' });
                            sendWebPushNotificaction(subscription, payload)
                            //**send whatsapp to admin */
                            sendNotificationWhatsApp("Se genero una venta real en carrery, revisa el seguimiento", "5217151049009")
                            //**send whatsapp cliente */
                            sendNotificationWhatsApp(`Tu pedido se ha realizado con exito, ya se esta procesando. Puedes rastrear tu pedido en carrery.com/seguimiento/numero-rastreo con este numero de pedido ${idventa}`, `521${telefono}`)
                            //**send whatsapp customer */
                            connection.query(`SELECT * FROM tienda where idtienda=${idtienda}`,
                                [], function (error, resultnotification, fields) {
                                    if (error) throw error;
                                    sendNotificationWhatsApp("Tienes un pedido nuevo desde carrery ingresa a tu dashboard de negocio en carrery.com/customer", `521${resultnotification[0].whatsapp}`)
                                });

                            console.log("telefono", telefono)
                        });
                });
        });
}

var namephotos = [];
var logotienda = [];
var photosrepartidor = [];
const storage = multer.diskStorage({
    destination: path.join(__dirname, 'public/uploads'),
    filename: (req, file, cb) => {
        var nombre = uuid() + path.extname(file.originalname).toLocaleLowerCase()
        namephotos.push(nombre);
        cb(null, nombre);
    }
});

const storagetienda = multer.diskStorage({
    destination: path.join(__dirname, 'public/uploads'),
    filename: (req, file, cb) => {
        var nombre = uuid() + path.extname(file.originalname).toLocaleLowerCase()
        logotienda.push(nombre);
        cb(null, nombre);
    }
});

const storagerepartidor = multer.diskStorage({
    destination: path.join(__dirname, 'public/uploads'),
    filename: (req, file, cb) => {
        var nombre = uuid() + path.extname(file.originalname).toLocaleLowerCase()
        photosrepartidor.push(nombre);
        cb(null, nombre);
    }
});

var upload = multer({ storage: storage })
var uploadtienda = multer({ storage: storagetienda })
var uploadrepartidor = multer({ storage: storagerepartidor })

app.post('/api/tienda', uploadtienda.array('myFile', 3), async (req, res) => {
    const form = JSON.parse(JSON.stringify(req.body))
    const files = req.files;
    if (!files) {
        const error = new Error('Please choose files')
        error.httpStatusCode = 400
        return next(error)
    }
    var logoTien = "";
    logotienda.map((row) => {
        logoTien = row
    });
    const {
        hora_apertura,
        hora_cierre,
        calle,
        numero,
        colonia,
        cp,
        ciudad,
        telefono,
        pagina_web,
        red_social,
        whatsapp,
        nombre_tienda,
        cuentaclabe = "",
        rfc,
        entre_calles,
        password,
        repassword,
        status,
        beneficiario,
        banco,
        horario
    } = form;
    const logotipo = `${logotienda}`
    connection.query(`SELECT * FROM usuario where telefono=? and status=2`,
        [telefono], function (error, resultsusuario, fields) {
            if (error) throw error;
            console.log("resultsusuario tienda",resultsusuario)
            if (resultsusuario.length > 0) {
                res.json({ respuesta: "Telefono ya registrado, si crees que es un error contacta a soporte" });
            } else {
                connection.query(`INSERT INTO usuario VALUES(null,?,?,?,?,?,?,?,?,?,?,?,'${fechaActual()}',?)`,
                    [
                        nombre_tienda,
                        calle,
                        numero,
                        colonia,
                        cp,
                        ciudad,
                        telefono,
                        rfc,
                        entre_calles,
                        password,
                        repassword,
                        status
                    ], function (error, resultsuser, fields) {
                        if (error) throw error;
                        if (resultsuser.affectedRows > 0) {
                            connection.query(`INSERT INTO tienda VALUES(null,?,?,?,?,?,?,?,?,?,?,'${fechaActual()}',?,1)`,
                                [
                                    hora_apertura,
                                    hora_cierre,
                                    pagina_web,
                                    red_social,
                                    whatsapp,
                                    nombre_tienda,
                                    cuentaclabe,
                                    beneficiario,
                                    banco,
                                    logotipo,
                                    idusuario = resultsuser.insertId
                                ],
                                function (error, results, fields) {
                                    if (error) throw error;
                                    if (results.affectedRows > 0) {
                                        statusTienda(results.insertId)
                                        insertHorario(results.insertId, horario)
                                        res.json(results);
                                    } else {
                                        res.json([]);
                                    }
                                    namephotos = []
                                    res.end();
                                });
                        } else {
                            res.json([]);
                        }
                        // res.end();
                    });
            }
        });
});

app.post('/api/producto', upload.array('myFile', 3), async (req, res) => {
    const form = JSON.parse(JSON.stringify(req.body))
    const files = req.files;
    if (!files) {
        const error = new Error('Please choose files')
        error.httpStatusCode = 400
        return next(error)
    }
    var photosCad = "";
    namephotos.map((row) => {
        photosCad = row
    });
    const {
        nombre,
        fotos = `${namephotos}`,
        precio,
        descripcion,
        cantidad,
        idtienda,
        t_entrega,
        categoria
    } = form;
    connection.query(`INSERT INTO producto VALUES(null,?,?,?,?,?,?,?,?,'${fechaActual()}',0,1)`,
        [
            nombre,
            fotos,
            precio,
            descripcion,
            cantidad,
            idtienda,
            t_entrega,
            categoria
        ],
        function (error, results, fields) {
            if (error) throw error;
            if (results.affectedRows > 0) {
                res.json(results);
            } else {
                res.json([]);
            }
            namephotos = []
            res.end();
        });
})

app.post('/api/shoper',
    uploadrepartidor.array('myFile', 12),
    async (req, res) => {
        const form = JSON.parse(JSON.stringify(req.body))
        console.log("shoper", req.body)
        // const files = req.files;
        // if (!files) {
        //     const error = new Error('Please choose files')
        //     error.httpStatusCode = 400
        //     return next(error)
        // }
        // var photosCad = "";
        // photosrepartidor.map((row) => {
        //     photosCad = row
        // });
        const {
            whatsapp,
            nombre,
            telefono,
            calle,
            numero,
            colonia,
            cp,
            ciudad,
            password,
            repassword,
            rfc = "",
            entre_calles = "",
        } = form;

        connection.query(`SELECT * FROM usuario where telefono=? and status=4`,
            [telefono], function (error, resultsusuario, fields) {
                if (error) throw error;
                if (resultsusuario.length > 0) {
                    res.json({ respuesta: "Telefono ya registrado, si crees que es un error contacta a soporte" });
                } else {
                    connection.query(`INSERT INTO usuario VALUES(null,?,?,?,?,?,?,?,?,?,?,?,'${fechaActual()}',4)`,
                        [
                            nombre,
                            calle,
                            numero,
                            colonia,
                            cp,
                            ciudad,
                            telefono,
                            rfc,
                            entre_calles,
                            password,
                            repassword
                        ], function (error, resultsuser, fields) {
                            if (error) throw error;
                            if (resultsuser.affectedRows > 0) {
                                connection.query(`INSERT INTO shoper VALUES(null,?,?,?,?,?,'${fechaActual()}',?,1)`,
                                    [
                                        nombre,
                                        telefono,
                                        whatsapp,
                                        password,
                                        repassword,
                                        idusuario = resultsuser.insertId
                                    ],
                                    function (error, results, fields) {
                                        if (error) throw error;
                                        if (results.affectedRows > 0) {
                                            res.json(results);
                                            // statusDelivery(results.insertId)
                                        } else {
                                            res.json([]);
                                        }
                                        // photosrepartidor = []
                                        res.end();
                                    });

                            } else {
                                res.json([]);
                            }
                            // res.end();
                        });
                }
            });
    })

app.post('/api/repartidor', uploadrepartidor.array('myFile', 12), async (req, res) => {
    const form = JSON.parse(JSON.stringify(req.body))
    const files = req.files;
    if (!files) {
        const error = new Error('Please choose files')
        error.httpStatusCode = 400
        return next(error)
    }
    var photosCad = "";
    photosrepartidor.map((row) => {
        photosCad = row
    });
    const {
        nombre,
        telefono,
        ine,
        curp,
        rfc,
        direccion,
        documentos = `${photosrepartidor}`,
        fecha_nacimiento,
        referencia,
        apellido_paterno,
        apellido_materno,
        vehiculo,
        calle,
        numero,
        colonia,
        cp,
        ciudad,
        entre_calles,
        password,
        repassword,
        status,
        cuentaclabe
    } = form;

    connection.query(`SELECT * FROM usuario where telefono=? and status=3`,
        [telefono], function (error, resultsusuario, fields) {
            if (error) throw error;
            if (resultsusuario.length > 0) {
                res.json({ respuesta: "Telefono ya registrado, si crees que es un error contacta a soporte" });
            } else {
                connection.query(`INSERT INTO usuario VALUES(null,?,?,?,?,?,?,?,?,?,?,?,'${fechaActual()}',?)`,
                    [
                        nombre,
                        calle,
                        numero,
                        colonia,
                        cp,
                        ciudad,
                        telefono,
                        rfc,
                        entre_calles,
                        password,
                        repassword,
                        status
                    ], function (error, resultsuser, fields) {
                        if (error) throw error;
                        if (resultsuser.affectedRows > 0) {
                            connection.query(`INSERT INTO repartidor VALUES(null,?,?,?,?,?,?,?,?,?,?,'${fechaActual()}',1)`,
                                [
                                    ine,
                                    curp,
                                    documentos,
                                    fecha_nacimiento,
                                    referencia,
                                    apellido_paterno,
                                    apellido_materno,
                                    vehiculo,
                                    cuentaclabe,
                                    idusuario = resultsuser.insertId
                                ],
                                function (error, results, fields) {
                                    if (error) throw error;
                                    if (results.affectedRows > 0) {
                                        res.json(results);
                                        statusDelivery(results.insertId)
                                    } else {
                                        res.json([]);
                                    }
                                    photosrepartidor = []
                                    res.end();
                                });

                        } else {
                            res.json([]);
                        }
                        // res.end();
                    });
            }
        });
})

// Serve static files like js and css
app.use(express.static(__dirname + '/public'));
app.use("/api/static", express.static(__dirname + '/public/uploads'));

/**Descomentar para pruebas en local y  comentar para produccion */
// app.listen(9000, function () {
//     console.log("Working on port 9000");
// });

// Starting both http & https servers
// const httpServer = http.createServer(app);

// httpServer.listen(9001, () => {
//     console.log('HTTP Server running on port 9001');
// });

/**Habilitar para produccion */
const httpsServer = https.createServer(credentials, app);
httpsServer.listen(9000, () => {
    console.log('HTTPS Server running on port 9000');
});

/**Codigo de notificaciones web push */

// const express = require('express');
const webpush = require('web-push');
const { response } = require("express");
require('dotenv').config()
const publicVapidKey = process.env.PUBLIC_VAPID_KEY || "BEFrsWe2_uFEwCR3ah1H_hIySquR7z4wsrSqey6U_rZYcBa317--cN_WhHPoB_6tyjcnB7SRko_n0QXtuGHqvEc";
const privateVapidKey = process.env.PRIVATE_VAPID_KEY || "EuD4MQ1ev_l-8LL0_4HA9DlMEnxa3V7nns2-xhvlI_o";

// Replace with your email
webpush.setVapidDetails('mailto:gerardoperezsoria@gmail.com', publicVapidKey, privateVapidKey);

// const app = express();

// app.use(require('body-parser').json());

app.post('/api/subscribe', (req, res) => {
    const { subscription, idtienda } = req.body;
    console.log("subscription", subscription, idtienda)
    const payload = JSON.stringify({ title: 'Bienvenido a carrery' });
    const payload2 = JSON.stringify({ title: 'Bienvenido a las notificaciones de carrery.com' });
    res.status(201).json({});

    connection.query(`SELECT * FROM suscriptor where idtienda=? and auth=? and status=1`,
        [idtienda, subscription.keys.auth], function (error, resultssuscriptor, fields) {
            if (error) throw error;
            if (resultssuscriptor.length === 0) {
                connection.query(`INSERT INTO suscriptor VALUES(null,?,?,?,?,?,?,1)`,
                    [idtienda, subscription.endpoint, subscription.expirationTime, subscription.keys.p256dh, subscription.keys.auth, fecha_registro = fechaActual()], function (error, results, fields) {
                        if (error) throw error;
                        if (results.affectedRows > 0) {
                            sendWebPushNotificaction(subscription, payload)
                        }
                    });
            } else {
                sendWebPushNotificaction(subscription, payload2)
            }
        });
});

app.post('/api/precioentregaportienda', (req, res) => {
    const { precioentrega, idtienda } = req.body;

    connection.query(`SELECT * FROM precioenvio where idtienda=? and status=1`, [idtienda], function (error, resultsselect, fields) {
        if (error) throw error;
        if (resultsselect.length > 0) {
            connection.query(`UPDATE precioenvio SET precioenvio=? where idtienda=? and status=1`,
                [precioentrega, idtienda], function (error, resultsupdate, fields) {
                    if (error) throw error;
                    console.log("update precio envio", resultsupdate)
                    res.json({ respuesta: "Precio actualizado correctamente." });
                    res.end();
                });
        } else {
            connection.query(`INSERT INTO precioenvio VALUES(null,?, ?, '${fechaActual()}', 1)`,
                [idtienda, precioentrega], function (error, resultsinsert, fields) {
                    if (error) throw error;
                    if (resultsinsert.affectedRows > 0) {
                        res.json({ respuesta: "Precio guardado correctamente." });
                        res.end();
                    } else {
                        res.json([]);
                        res.end();
                    }
                });
        }

    });
});


app.get('/api/categorias', function (req, res) {
    const { idtienda } = req.params
    connection.query(`select categoria from producto  where categoria is not null group by categoria`, [], function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
            res.json(results);
        } else {
            res.json([]);
        }
        res.end();
    });
});

app.get('/api/precioentregaportienda/:idtienda', function (req, res) {
    const { idtienda } = req.params
    connection.query(`SELECT * FROM precioenvio where idtienda=? and status=1`, [idtienda], function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
            res.json(results);
        } else {
            res.json([]);
        }
        res.end();
    });
});

function sendWebPushNotificaction(subscription, payload) {
    console.log(subscription);
    webpush.sendNotification(subscription, payload).catch(error => {
        console.error(error.stack);
    });

}

app.post('/api/sendwebpushnotification', (req, res) => {
    const { idtienda } = req.body;
    const payload = JSON.stringify({ title: 'Pedido nuevo' });
    connection.query(`SELECT * FROM suscriptor where idtienda=? and status=1`,
        [idtienda], function (error, resultssuscriptor, fields) {
            if (error) throw error;
            console.log("subscription back", resultssuscriptor[0], resultssuscriptor[0].endpoint)
            const subscription = {
                endpoint: resultssuscriptor[0].endpoint,
                expirationTime: 500,
                keys: {
                    p256dh: resultssuscriptor[0].p256dh,
                    auth: resultssuscriptor[0].auth
                }
            }
            console.log("send web push")
            webpush.sendNotification(subscription, payload).catch(error => {
                console.error(error.stack);
            });
        });

    res.status(200).json({});


});

app.use(require('express-static')('./'));
