
const formRegistro = document.getElementById("formRegistro");
const formLogin = document.getElementById("formLogin");
const formDeposit = document.getElementById("formDeposit");
const formTransferencia = document.getElementById("formTransferencia");


/********  Registro *******/
if(formRegistro){
    formRegistro.addEventListener("submit", function(event){
        event.preventDefault();

        const nombre = document.getElementById("nombre").value;
        const rut = document.getElementById("rut").value;
        const correo = document.getElementById("correo").value;
        const password = document.getElementById("password").value;
        const passwordConfirm = document.getElementById("passwordConfirm").value;

        if(password!==passwordConfirm){
            document.getElementById("mensaje").innerHTML=`
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                Las contraseñas no coinciden
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
            `
            return;
        };

        const nuevoUsuario = {
            nombre,
            rut,
            correo,
            password
        }

        /** obtener usuarios */
        let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

        usuarios.push(nuevoUsuario);

        localStorage.setItem("usuarios", JSON.stringify(usuarios))
        
        document.getElementById("mensaje").innerHTML=`
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                Registro exitoso. Redirigiendo...
            </div>
            `
        /** tiempo antes de redireccionar al login.html 3seg */ 
        setTimeout(()=>{
            window.location.href= "login.html";
        }, 3000);
    })
}

/*************** Login ***************/
if(formLogin){
    formLogin.addEventListener("submit", function(event){
        event.preventDefault();

        const rut = document.getElementById("rut").value;
        const password = document.getElementById("password").value;
        
        const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

        const usuarioEncontrado = usuarios.find(function(user){
            return user.rut === rut && user.password === password; 
        })

        if(usuarioEncontrado){
            localStorage.setItem("usuarioLogueado", JSON.stringify(usuarioEncontrado))
            document.getElementById("mensaje").innerHTML=`
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                Inicio de sesión exitoso. Redirigiendo...
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
            `;
            setTimeout(()=>{
                window.location.href="menu.html";
            }, 3000)
        }

        else{
            document.getElementById("mensaje").innerHTML=`
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                Usuario o contraseña incorrecto.
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
            `;
        }
    })
}

/*************** Deposit ***************/

if(formDeposit){
    formDeposit.addEventListener("submit", function(event){
        event.preventDefault();

        const monto = document.getElementById("deposito").value;
        const destino = "Cuenta propia";
        const comentario = "Ha depositado en su misma cuenta";
        const rut = usuarioLogueado();
        agregarTransaccion(monto,destino,comentario,"deposito",rut);
        formDeposit.reset();
    })
}

/*************** Sendmoney ***************/
if(formTransferencia){

    formTransferencia.addEventListener("submit", function(event){
        event.preventDefault();
        //obtiene el valor del select
        const rutDestinatario = document.getElementById("selectDestinatario").value;
        //busca los datos del destinatario seleccionado
        const destinatarios = JSON.parse(localStorage.getItem("destinatarios")) || [];
        const destinatarioEncontrado = destinatarios.find(user => user.rut === rutDestinatario);
        //datos para registrar transferencia
        const monto = document.getElementById("montoTransferencia").value;
        const destino = destinatarioEncontrado.banco;
        const comentario = "Trf. realizada a "+ destinatarioEncontrado.nombre;
        const rut = usuarioLogueado();

        agregarTransaccion(monto,destino,comentario,"transferencia",rut);

        formTransferencia.reset();
    });
}

/******* lista seleccion Destinatario *********/
function listarDestinatarios(){
    const seleccion = document.getElementById("selectDestinatario");
    //limpia el select option para no repetir destinatarios
    seleccion.innerHTML = '<option value="">Seleccionar</option>';
    const destinatarios = JSON.parse(localStorage.getItem("destinatarios")) || [];
    const userLogin = usuarioLogueado();
    /**recorrer array */
    destinatarios.forEach(function (destinatario) {
        if(destinatario.userLogin===userLogin){
            const opcion = document.createElement("option");
            opcion.value = destinatario.rut;
            opcion.textContent = destinatario.nombre + " - "  + destinatario.banco;
            
            seleccion.appendChild(opcion);
        }
    });
    return;
}

/*****Modal Nuevo Destinatario *********/
function agregarDestinatario(){
    const userLogin = usuarioLogueado();
    const nombre = document.getElementById("nombre").value;
    const rut = document.getElementById("rut").value;
    const banco = document.getElementById("banco").value;
    const numeroCuenta = document.getElementById("numeroCuenta").value;

    const nuevoDestinatario = {
        userLogin,
        nombre,
        rut,
        banco,
        numeroCuenta
    }

    console.log(nuevoDestinatario);
    /**obtener destinatarios */
    let destinatarios = JSON.parse(localStorage.getItem("destinatarios")) || [];
    destinatarios.push(nuevoDestinatario);
    localStorage.setItem("destinatarios", JSON.stringify(destinatarios));

    /**Cerrar el modal al agregar destinatario */
    const modalDestinatario= document.getElementById("modalNuevoDestinatario");
    const modal = bootstrap.Modal.getInstance(modalDestinatario);
    modal.hide();

    document.getElementById("mensaje").innerHTML=`
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            Registro exitoso.
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    setTimeout(() => {
        document.getElementById("mensaje").innerHTML=`<div></div>`;
    }, 2000);

    /**Actualiza la lista de destinatarios */
    listarDestinatarios();
}

/************* Transaction ************/
function mostrarTransacciones(){
    /**obtener transacciones  */
    const transacciones = JSON.parse(localStorage.getItem("transacciones")) || [];
    const tabla = document.getElementById("tablaTransacciones");
    const userLogin = usuarioLogueado();
    /**recorrer array transacciones*/
    transacciones.forEach(function (transaccion) {

        // lista las transacciones que corresponden al usuario loguedao
        if(transaccion.userLogin===userLogin){
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${transaccion.fechaRegistro}</td>
                <td>${transaccion.destino}</td>
                <td>${transaccion.comentario}</td>
                <th scope="row">${"$ "+transaccion.monto || ""}</td>
            `;
            tabla.appendChild(fila);
        }
    });
    return;
}

/********* Últimos 3 movimientos */
function ultimasTransacciones(){
    /**obtener transacciones  */
    const transacciones = JSON.parse(localStorage.getItem("transacciones")) || [];
    const tabla = document.getElementById("ultimosMovimientos");
    const userLogin= usuarioLogueado();
    // obtener últimos 3 usuarios
    const ultimosMovimientos = transacciones.slice(-3);

    /**recorrer array transacciones*/
    ultimosMovimientos.forEach(function (transaccion) {
        if(transaccion.userLogin===userLogin){
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${transaccion.fechaRegistro}</td>
                <td>${transaccion.destino}</td>
                <th scope="row">${"$ "+transaccion.monto || ""}</td>
            `;
            tabla.appendChild(fila);
        }
    });
    return;
}

/************* Cerrar sesión ***********/
function sesionSegura(){
    const usuarioLogueado = localStorage.getItem("usuarioLogueado");
    /** valida usuario logeado */
    if(!usuarioLogueado){
        window.location.href= "login.html";
    }
    /*guarda el nombre del usuario y lo muestra en el nav*/
    const usuario = JSON.parse(localStorage.getItem("usuarioLogueado"));
    document.getElementById("nombreUsuario").textContent = usuario.nombre;

    /*Cerrar sesión*/
    document.getElementById("logout").addEventListener("click", function(){
        localStorage.removeItem("usuarioLogueado");
        window.location.href = "index.html";
    })
}

/************* Saldo Disponible ***********/
function saldoDisponible(){
    let saldoDisponible = 0;
    const transacciones = JSON.parse(localStorage.getItem("transacciones")) || [];
    const userLogin = usuarioLogueado();
    /**recorrer array transacciones*/
    transacciones.forEach(function (transaccion) {
        if(transaccion.userLogin===userLogin){
            saldoDisponible = saldoDisponible + parseInt(transaccion.monto);
        }
    });
    document.getElementById("saldo").textContent = "$ " + saldoDisponible;
    return;
}

/************* Agregar Transacción ***********/
function agregarTransaccion(monto,destino,comentario,tipo,userLogin){
    if(monto<=0){
        document.getElementById("mensaje").innerHTML=`
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            El monto debe ser mayor a 0
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
        `;
        setTimeout(() => {
            document.getElementById("mensaje").innerHTML=`<div></div>`;
        }, 2000);
        return;
    };

    if(tipo==="transferencia"){
        monto = parseInt(monto)*(-1);
    }

    const nuevaTransaccion = {
        userLogin,
        monto,
        destino,
        comentario,
        fechaRegistro: new Date().toLocaleString() //captura la fecha actual del registro
    }

    /** obtener transacciones */
    let transacciones =JSON.parse(localStorage.getItem("transacciones")) || [];

    transacciones.push(nuevaTransaccion);
    localStorage.setItem("transacciones", JSON.stringify(transacciones));

    document.getElementById("mensaje").innerHTML=`
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            Transacción realizada con éxito. 
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;    
    setTimeout(() => {
        document.getElementById("mensaje").innerHTML=`<div></div>`;
    }, 2000);
}

function usuarioLogueado(){
    const usuarioLogueado = localStorage.getItem("usuarioLogueado");
    const usuario = JSON.parse(localStorage.getItem("usuarioLogueado"));
    const rut = usuario.rut;

    return rut;
}
