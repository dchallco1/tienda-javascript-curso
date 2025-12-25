//Intentamos cargar la lista guardad, si no hay nada, empezamos con una lista vacia.
let productosguardados = JSON.parse(localStorage.getItem("carrito")) || [];

//1.CACHEAMOS EL DOM (fuera de la funcion para que no se vuelva a buscar cada vez que se llame)
//Estas variables son "globales" para este archivo app.js
const titulo = document.getElementById("titulo");
const inputproducto = document.getElementById("cajaproducto");
const inputprecio = document.getElementById("cajaprecio");
const lista = document.getElementById("listacompras");
const sumatotal = document.getElementById("textototal");

// 2. VARIABLE ACUMULADORA
//¡IMPORTANTE! est|a variable debe estar fuera de la funcion para que no se reinicie cada vez que se llame
let total = 0;
//FUNCIONES

function agregaralcarrito() {
    // OBTENEMOS LOS ELEMENTOS DEL DOM (los valores que el usuario escribio)
    //extraemos el valor (el texto) que el usuario escriio
    let producto = inputproducto.value;
    let precio = inputprecio.value;
    // validacion si falta producto o precio
    if (producto === "" || precio === "") {
        alert("porfavor, agrega un producto y su precio");
    } else {
        // 3. LA TRANSFORMACION DE DATOS (la parte clave)
        // convertimos el texto del precio a Numero decimal
        let precionumero = parseFloat(precio);

        // 4. LA LOGICA DE NEGOCIO (la parte clave)
        //creamos un objeto con la info del producto
        let nuevoproducto = {
            nombre: producto,
            precio: precionumero
        };
        // lo metemos en nuestro array de productos (guardar en memoria y Localstorage)
        productosguardados.push(nuevoproducto);
        //¡LO GUARDAMOS EN EL ARCHIVADOR!
        //guardamos el array actualizado en el local storage (como texto)
        localStorage.setItem("carrito",JSON.stringify(productosguardados));
        //Actualizar total global (añadido por refactorizacion)
        total = total + precionumero;
        sumatotal.innerText = `Total: $${total} pesos argentinos`;
        // 4. ¡LLAMAR A LA MAESTRA (ella hace el resto)
        crearElementoVisual(nuevoproducto);
        //Limpiamos los inputs
        inputproducto.value = "";
        inputprecio.value = "";
        titulo.innerText = `Agregaste: ${producto} al carrito.`;
        }
}

function limpiar() {
    //limpiamos
    total = 0; //reiniciamos el total
    sumatotal.innerText = "total a pagar: $0"; //reiniciamos el texto del total
    lista.innerHTML = ""; //vaciamos la lista visual
    titulo.innerText = "Tienda EL SIN MIEDO";
    titulo.style.color = "black";
    titulo.style.fontSize = "initial";
    // 1. LIMPIAR MEMRIA RAM (El array)
    productosguardados = []; //vaciamos la lista interna
    // 2. LIMPIAR ARCHIVADOR (LocalStorage)
    localStorage.removeItem("carrito"); //borramos el archivo fisico
    
}

//esto va al final del archivo (fuera de cualquier funcion)
//queremos que la caja de precio "escuche " el teclado
inputprecio.addEventListener("keypress", function(event) {
    //si la tecla presionada es "Enter" (código 13)
    if (event.key === "Enter") {
        //llamamos a la funcion agregar al carrito
        agregaralcarrito();
    }
});

function cargarcarrito() {
    //recorremos los productos que recuperemos del archivador
    productosguardados.forEach(item => {
        // 1. Llamammos a la Maestra para que cree el elemento visual
        crearElementoVisual(item);
        //2. Solo sumammos el total la maestra no suma solo borra
        total += item.precio;
    });
    //actualizamos el total en pantalla
    sumatotal.innerText = `Total: $${total} pesos argentinos`;
}
//llamamos a la funcion para cargar el carrito al iniciar la pagina
cargarcarrito();

// 1. La palabra "async" avisa que esta funcion va a tardar un poco en completarse
async function importarproductos() {
    //mostramos un aviso visual de "cargando.."
    titulo.innerText = "Cargando productos del servidor...";

    try {
        // 2. hacer el pedido (Fetch) a la URL del servicio
        //await dice: "javaScript, epsera aui hasta que el servidor responda"
        let respuesta = await fetch(`https://fakestoreapi.com/products?limit=5`);

        // 3. convertir la respuesta 
        //el servidor nos manda texto lo convertimos a JSON (datos usables)
        let datos = await respuesta.json();

        // 4. PROCESAR LOS DATOS RECIBIDOS
        //`datos`es un array de productos que vino de internet.
        // vamos a recorrerlo igual que haciamos con tu lista manual
        datos.forEach(producto => {
        
            //reutilizamos la logica de arreglar al array de productos guardados (memoria)
            let nuevoproducto = { //1.crea los prodcutos
                nombre: producto.title, //la API usa `title`en vez de `nombre`
                precio: producto.price //la API usa `price` en vez de `precio`
            };//2. Guardar en memoria y localstorage
            //agregamos a nuestra memoria y guardamos
            productosguardados.push(nuevoproducto);
            localStorage.setItem("carrito",JSON.stringify(productosguardados));
            //3. Actualiza el total
            total += nuevoproducto.precio;
            //4. Llamamos a la maestra para crear el elemento visual
            crearElementoVisual(nuevoproducto);

        });
        //Actualizamos el total final en pantalla
        sumatotal.innerText = `Total: $${total} pesos argentinos`;
        //restauramos el titulo original
        titulo.innerText = "¡Importacion Exitosa!";
    } catch (error) {
        //si se corta e internet o falla el servidor, caemos aqui
        alert("Hubo un error al traer los productos de la nube");
        titulo.innerText = "error en la conexion";
    }
}

//--FUNCION MAESTRA: LA FABRICA VISUAL
// Recibe un obeto `item` que tiene {nombre:"...", precio; 123}
function crearElementoVisual(item) {

    //1. crear el <li>
    let nuevoelemento = document.createElement("li");

    //2. crear el boton eliminar
    let botoneliminar = document.createElement("button");
    botoneliminar.innerText = "❌";
    botoneliminar.style.marginLeft = "10px";

    //3. Logica del boton (cerrada aqui dentro)
    botoneliminar.onclick = function() {
        //A. Actualizar total (Resta)
        total = total - item.precio;
        sumatotal.innerText = `Total: $${total} pesos argentinos`;

        //B. Borrar de la pantalla
        nuevoelemento.remove();

        //C. borrar de la memoria y actualizar localstorage
        productosguardados = productosguardados.filter(prod => prod !== item);
        localStorage.setItem("carrito",JSON.stringify(productosguardados));  
    };
    //4. Armar y pegar
    nuevoelemento.innerText = `${item.nombre} - $${item.precio} pesos argentinos`;
    nuevoelemento.appendChild(botoneliminar);
    lista.appendChild(nuevoelemento);
}