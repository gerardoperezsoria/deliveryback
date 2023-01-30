CREATE TABLE usuario (
    idusuario int NOT NULL AUTO_INCREMENT,
    nombre varchar(255),
    calle varchar(255),
    numero varchar(255),
    colonia varchar(255),
    cp varchar(255),
    ciudad varchar(255),
    telefono varchar(255),
    rfc varchar(255),
    entre_calles varchar(255),
    contrasena varchar(255),
    recontrasena varchar(255),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status char(1),
    PRIMARY KEY (idusuario)
);

ALTER TABLE usuario ADD COLUMN contrasena varchar(255) AFTER entre_calles;
ALTER TABLE usuario DROP COLUMN password;

ALTER TABLE usuario ADD COLUMN recontrasena varchar(255) AFTER contrasena;
ALTER TABLE usuario DROP COLUMN repassword;

insert into usuario values(
    null,
    "charles cart",
    "morelos norte",
    "7151049009",
    "miguel carrillo y cuauhtemoc",
    "casa blanca",
    "1234567890",
    "1234567890",
    1
);

CREATE TABLE tienda (
    idtienda int NOT NULL AUTO_INCREMENT,
    hora_apertura varchar(255),
    hora_cierre varchar(255),
    pagina_web varchar(255),
    red_social varchar(255),
    whatsapp varchar(255),
    nombre_tienda varchar(255),
    cuentaclabe char(18),
    beneficiario varchar(255),
    banco varchar(255),
    logotipo varchar(255),
    fechahora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    idusuario int,
    status char(1),
    PRIMARY KEY (idtienda),
    FOREIGN KEY (idusuario) REFERENCES usuario(idusuario)
);

CREATE TABLE statustienda (
    idstatustienda int NOT NULL AUTO_INCREMENT,
    fechahora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    idtienda int,
    autoservicio char(1) DEFAULT 1,
    status char(1),
    PRIMARY KEY (idstatustienda),
    FOREIGN KEY (idtienda) REFERENCES tienda(idtienda)
);

CREATE TABLE repartidor (
    idrepartidor int NOT NULL AUTO_INCREMENT,
    ine varchar(255),
    curp varchar(255),
    documentos varchar(255),
    fecha_nacimiento varchar(255),
    referencia varchar(255),
    apellido_paterno varchar(255),
    apellido_materno varchar(255),
    vehiculo varchar(255),
    cuentaclabe varchar(255),
    idusuario int,
    fechahora TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    status char(1),
    PRIMARY KEY (idrepartidor)
);

CREATE TABLE statusdelivery (
    idstatusdelivery int NOT NULL AUTO_INCREMENT,
    idrepartidor int,
    fechahora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status char(1),
    statusaprovacion char(1),
    PRIMARY KEY (idstatusdelivery),
    FOREIGN KEY (idrepartidor) REFERENCES repartidor(idrepartidor)
);

ALTER TABLE statusdelivery ADD COLUMN statusaprovacion char(1) AFTER status;

CREATE TABLE horario (
    idhorario int NOT NULL AUTO_INCREMENT,
    dia varchar(250),
    hora_apertura varchar(250),
    hora_cierre varchar(250),
    status_dia char(1),
    idtienda int,
    status char(1),
    PRIMARY KEY (idhorario),
    FOREIGN KEY (idtienda) REFERENCES tienda(idtienda)
);

ALTER TABLE tienda ADD COLUMN cuentaclabe char(18) AFTER nombre_tienda;
ALTER TABLE tienda ADD FOREIGN KEY(idusuario) REFERENCES usuario(idusuario);

ALTER TABLE tienda ADD COLUMN beneficiario varchar(255) AFTER cuentaclabe;
ALTER TABLE tienda ADD COLUMN banco varchar(255) AFTER beneficiario;
ALTER TABLE tienda ADD COLUMN logotipo varchar(255) AFTER banco;

insert into tienda values(
        null,
    "10:00",
    "16:00",
    "degollado norte",
    "45",
    "centro",
    "61518",
    "zitacuaro"
    "7152345678",
    "algo.com",
    "facebook.com/algo",
    "7151049009",
    "Mas tienda",
    "PESG238719FR0",
    null,
    1
);

CREATE TABLE producto (
    idproducto int NOT NULL AUTO_INCREMENT,
    nombre varchar(255),
    fotos varchar(255),
    precio double(13,2),
    descripcion TINYTEXT,
    cantidad int,
    idtienda int,
    t_entrega varchar(255),
    categoria varchar(255),
    fechahora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    envio char(1) DEFAULT 0,
    status char(1),
    PRIMARY KEY (idproducto),
    INDEX (idproducto),
    FOREIGN KEY (idtienda) REFERENCES tienda(idtienda)
);

ALTER TABLE producto ADD COLUMN envio char(1) DEFAULT 0 AFTER fechahora;
ALTER TABLE producto MODIFY categoria VARCHAR(255);


insert into producto values(
    null,
    "hamburguesa",
    "foto,foto2,foto3",
    100.50,
    "Este es un producto de prueba",
    100,
    1,
    "30 minutos",
    null,
    1
    );


CREATE TABLE venta (
    idventa int NOT NULL AUTO_INCREMENT,
    idproducto int,
    cantidad int,
    idtienda int,
    direccion varchar(255),
    colonia varchar(255),
    estado varchar(255),
    ciudad varchar(255),
    pais varchar(255),
    cp varchar(255),
    nombre varchar(255),
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    status char(1),
    PRIMARY KEY (idventa),
    INDEX (idventa),
    FOREIGN KEY (idproducto) REFERENCES producto(idproducto),
    FOREIGN KEY (idtienda) REFERENCES tienda(idtienda)
);

insert into venta values(null,2,2,1,null,1);

CREATE TABLE pago (
    idpago int NOT NULL AUTO_INCREMENT,
    idventa int,
    fechahora TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    status char(1),
    PRIMARY KEY (idpago),
    INDEX (idpago),
    FOREIGN KEY (idventa) REFERENCES venta(idventa)
);

insert into pago values(
        null,
    1,
    null,
1
);

CREATE TABLE pedido (
    idpedido int NOT NULL AUTO_INCREMENT,
    idventa int,
    idrepartidor int,
    idtienda int,
    hora_entrega varchar(255),
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status_repartidor char(1),
    status_tienda char(1),
    autoservicio char(1),
    notas TINYTEXT,
    telefono varchar(255),
    status char(1),
    PRIMARY KEY (idpedido),
    INDEX (idpedido),
    FOREIGN KEY (idventa) REFERENCES venta(idventa)
);

ALTER TABLE pedido ADD COLUMN notas TINYTEXT AFTER autoservicio;
ALTER TABLE pedido ADD COLUMN telefono varchar(255) AFTER notas;

insert into pedido values(
    null,
    5,
    1,
    null,
    1,
    "30 minutos",
    1
);

create table suscriptor(
    idsuscriptor int NOT NULL AUTO_INCREMENT,
    idtienda int,
    endpoint TINYTEXT,
    expirationTime int,
    p256dh TINYTEXT,
    auth varchar(255),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status char(1),
    PRIMARY KEY (idsuscriptor),
    INDEX (idsuscriptor),
    FOREIGN KEY (idtienda) REFERENCES tienda(idtienda)
);

create table precioenvio(
    idprecioenvio int NOT NULL AUTO_INCREMENT,
    idtienda int,
    precioenvio double(13,2),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status char(1),
    PRIMARY KEY (idprecioenvio),
    INDEX (idprecioenvio),
    FOREIGN KEY (idtienda) REFERENCES tienda(idtienda)
);

create table shoper (
    idshoper int NOT NULL AUTO_INCREMENT,
    nombre varchar(255),
    telefono varchar(255),
    whatsapp varchar(255),
    contrasena varchar(255),
    recontrasena varchar(255),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    idusuario int,
    status char(1),
    PRIMARY KEY (idshoper),
    INDEX (idshoper),
    FOREIGN KEY (idusuario) REFERENCES usuario(idusuario)
);

create table riderlevel2 (
    riderlevel2 int NOT NULL AUTO_INCREMENT,
    whatsapp varchar(255),
    pedidos int,
    status char(1),
    PRIMARY KEY (riderlevel2)
);
INSERT INTO riderlevel2 VALUES(null,"71510490092",0,1);

create table visitantes (
    idvisitantes int NOT NULL AUTO_INCREMENT,
    cantidad varchar(255),
    -- fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status char(1),
    PRIMARY KEY (idvisitantes)
);
INSERT INTO visitantes VALUES(null,0,1);

ALTER TABLE repartidor ADD COLUMN idusuario int AFTER cuentaclabe;
ALTER TABLE repartidor ADD FOREIGN KEY(idusuario) REFERENCES usuario(idusuario);

insert into repartidor values(
    null,
    "charles",
    "7151049009",
    "45435435435345",
    "erdfdf54535",
    "4545fdgfdg",
    "direccion repartidor",
    "ine, curp",
    "01/01/1990",
    "amigo me recomienda",
    "perez",
    "perez",
    "bicicleta",
    null, 
    1
);



DELIMITER |

CREATE TRIGGER updatepedido AFTER UPDATE 
ON pedido FOR EACH ROW
BEGIN
    IF NEW.status_repartidor = 2 OR NEW.status_tienda = 2 THEN
        UPDATE venta SET status=2 where OLD.status=1 and status_repartidor = 2 and status_tienda = 2;
    END IF;
END
|
DELIMITER ;




SELECT producto.nombre, producto.fotos, producto.descripcion, venta.cantidad, venta.direccion, venta.colonia, venta.estado, venta.ciudad, venta.pais, venta.cp, venta.nombre 
FROM venta
INNER JOIN producto
ON venta.idproducto=producto.idproducto
WHERE idventa=80;




    


SELECT statustienda.status as statustienda, producto.nombre, producto.descripcion, producto.fotos, producto.precio, producto.idproducto, producto.idtienda, producto.envio, tienda.hora_apertura, tienda.hora_cierre, tienda.nombre_tienda
FROM tienda
INNER JOIN producto
ON tienda.idtienda=producto.idtienda
INNER JOIN statustienda
ON statustienda.idtienda=producto.idtienda
WHERE producto.status=1;



SELECT horario.hora_apertura as hora_apertura_horario,horario.hora_cierre as hora_cierre_horario,horario.status_dia as status_dia_horario,statustienda.status as statustienda, producto.nombre, producto.descripcion, producto.fotos, producto.precio, producto.idproducto, producto.idtienda, producto.envio, tienda.hora_apertura, tienda.logotipo, tienda.hora_cierre, tienda.nombre_tienda
        FROM tienda
        INNER JOIN producto
        ON tienda.idtienda=producto.idtienda
        INNER JOIN statustienda
        ON statustienda.idtienda=producto.idtienda
        INNER JOIN horario
        ON horario.idtienda=producto.idtienda
        WHERE producto.status=1 and horario.status_dia=1 and horario.dia='sabado' and horario.status_dia=1;


        SELECT producto.status, horario.hora_apertura as hora_apertura_horario,horario.hora_cierre as hora_cierre_horario,horario.status_dia as status_dia_horario,statustienda.status as statustienda, producto.nombre, producto.descripcion, producto.fotos, producto.precio, producto.idproducto, producto.idtienda, producto.envio, tienda.hora_apertura, tienda.logotipo, tienda.hora_cierre, tienda.nombre_tienda
        FROM tienda
        INNER JOIN producto
        ON tienda.idtienda=producto.idtienda
        INNER JOIN statustienda
        ON statustienda.idtienda=producto.idtienda
        INNER JOIN horario
        ON horario.idtienda=producto.idtienda
        WHERE producto.status=1 and horario.status_dia=1 and horario.dia="viernes" and horario.status_dia=1 limit 50;

        select case DATE_FORMAT(curdate(),'%w') when 1 then 'LUNES' 
                                                                 WHEN 2 THEN 'MARTES' 
                                                                 WHEN 3 THEN 'MIERCOLES' 
                                                                 WHEN 4 THEN 'JUEVES' 
                                                                 WHEN 5 THEN 'VIERNES' 
                                                                 WHEN 6 THEN 'SABADO' 
                                                                 WHEN 7 THEN 'DOMINGO' 
                                                                 END) 

SELECT 
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
        and usuario.cp like '615%'
        and horario.status_dia=1 
        and horario.dia=(select case DATE_FORMAT(curdate(),'%w') when 1 then 'LUNES' 
                                                                 WHEN 2 THEN 'MARTES' 
                                                                 WHEN 3 THEN 'MIERCOLES' 
                                                                 WHEN 4 THEN 'JUEVES' 
                                                                 WHEN 5 THEN 'VIERNES' 
                                                                 WHEN 6 THEN 'SABADO' 
                                                                 WHEN 0 THEN 'DOMINGO' 
                                                                 END) 
        and horario.status_dia=1 limit 50;


        select DATE_FORMAT(curdate(),'%w')

/**Borrar un campo de una tabla mysql*/
        alter table statusdelivery drop statusaprovacion;



        SELECT horario.hora_apertura as hora_apertura_horario, 
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
        WHERE producto.idtienda=62 and producto.status=1 
        and horario.status_dia=1 and horario.dia='DOMINGO' and horario.status_dia=1 
        limit 50;