//recoge el elemento botón de los id indicados y ejecuta una función al clickear
var botonDefinir= document.getElementById("botonDefinir");
botonDefinir.onclick= verificarInputs;
var botonCalcular= document.getElementById("botonCalcular");
botonCalcular.onclick= calcularSubredes;
var botonReiniciar= document.getElementById("botonReiniciar");
botonReiniciar.onclick= reiniciar;

//variables iniciales
var direccionBase;
var mascaraBase;

//variables calculadas a partir de las iniciales; algunas ayudan a definir otras
var mascara_enBinario;
var cantidadSubredes;
var cantidadIngresada= 0;
var cantidadPedida= 0;
var cantidad_bitsUsadas= 0; //ayuda a calcular las ips disponibles según la mascara base
var direccion_conSplit= []; //variable inicial para calcular las direcciones con sus mascaras (línea 223)

//arreglos de elementos a mostrar en pantalla
var arreglo_Direcciones_deRed= [];
var arregloMascaras= [];

//cantidad de ips por subred según el input de host
var arreglo_ips_Subred= [];
//misma cantidad de ips pero en potencias de 2
var arreglo_ips_Subred_Potencia= [];

/*--------------Verifica los inputs de las variables iniciales al clickear "Definir Subredes"---------------------------*/
function verificarInputs(){
    //recoge los valores de los input y los asigna a las variables globales
    let direccionAux= document.getElementById("inputDireccion").value;
    let mascaraAux= document.getElementById("inputMascara").value;
    let cantSubredesAux= document.getElementById("cantidadSubredes").value;
    let ipsPorSubred= document.getElementById("ips_Subredes");

    //variable que ayuda a crear los inputs para los hosts por subred
    cantidadSubredes= parseInt(cantSubredesAux);
    
    //Confirma la direccion y cantidad de subredes con regex; la larga para dirección, la corta para subredes
    if (/^[^0]*([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(\.([0-9   ]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3}$/.test(direccionAux)
    && /[123456789]$/.test(cantSubredesAux)){
        direccionBase= direccionAux;
        mascaraBase= mascaraAux;
        
        //crea el apartamento de input para las subredes en html
        ipsPorSubred.innerHTML= "";
        for (let i= 0; i<cantidadSubredes; i++){
            ipsPorSubred.innerHTML+= "<input id='inputSubred" + (i+1) + "' required style='margin: 10px 10px 20px 0px' type='text' placeholder='IPs asignables para #" + (i+1) + "'>";
        }

        //habilita el botón una vez se ingresen las ip por subred
        botonCalcular.disabled= false;
        botonReiniciar.disabled= false;

    } else{
        alert("Uno de los campos ingresados es inválido")
    }
}

/*----------------------Calcula lógicamente las subredes que mostrará en html--------------------------------------------*/
function calcularSubredes(){
    var boolACumulado= 0; /*sumará 1 si hay un campo lleno, si el total de campos llenos es igual a 
    la cantidad de subredes ingresadas, entrará al if*/

    //reinicia el input del prefijo ingresado para volver a calcular la máscara
    let mascaraAux= document.getElementById("inputMascara").value;
    mascaraBase= mascaraAux;

    //Cuenta los campos que estén con valor como input
    for (let i= 0; i<cantidadSubredes; i++){
        let inputSubredAux= document.getElementById("inputSubred" + (i+1)).value;

        if (inputSubredAux!= ""){
            boolACumulado++;
        }
    }

    //calcula la cantidad de ips pedidas según la máscara base
    cantidadPedida= verificarCantidad_ips_solicitadas();

    //Hace la SUMATORIA de los ips por host ingresados
    for (let i= 0; i<cantidadSubredes; i++){
        cantidadIngresada+= parseInt(document.getElementById("inputSubred" + (i+1)).value);
    }

    /*verifica condicionales de input en los hosts de subredes y si la cantidad de hosts no supera las ips asignables
    definidas por la mascara base*/
    if (boolACumulado== cantidadSubredes && cantidadPedida> cantidadIngresada){
        //funciones que DEFINEN LAS SUBREDES y modifican el HTML PARA MOSTRAR
        direcciones_mascaras_Subredes();
        mostrarListaSubredes();
    } else {
        alert("Un campo de ip's está vacío o ingresó una cantidad que supera el prefijo base");
    }
    
}    

/*----------------------Retorna la cantidad de IPS TOTALES PEDIDAS SEGÚN LA MÁSCARA BASE PARA VERIFICAR--------------------------------*/
function verificarCantidad_ips_solicitadas (){
    //divide la máscara base en cuatro partes dentro de un arreglo auxiliar
    mascara_enBinario= mascaraBase.split(".");

    //Crea la máscara base en BINARIO convirtiendo de DECIMAL
    for (let i= 0; i<mascara_enBinario.length; i++){
        mascara_enBinario[i]= parseInt(mascara_enBinario[i]);
        mascara_enBinario[i]= convertir_Decimal_a_Binario(mascara_enBinario[i]);
    }

    //LEE la cantidad de bits utilizados, para definir una cantidad de bits libres
    for (let j= 0; j<mascara_enBinario.length; j++){
        let stringAux= mascara_enBinario[j];
        for (let k= 0; k< stringAux.length; k++){
            if (stringAux[k]== '1'){
                cantidad_bitsUsadas+= 1;
            }
        }
    }

    //retorna la cantidad de ips disponibles a partir de la máscara base ingresada
    return Math.pow(2, (32-cantidad_bitsUsadas));

}

/*------------------MODIFICA EL HTML para mostrar una lista con elementos de interés previamente------------------------
-----------------------------------almacenados(Dir. red, máscara, ips por subred)-------------------------------------*/
function mostrarListaSubredes(){
    var textoListaUl= document.getElementById("id-listaRedesCalculadas");
    textoListaUl.innerHTML= "<li id='cabeceraListaSubredes'>Dirección Red -  Máscara - IPs disponibles</li>";

    for (let i= 0; i< cantidadSubredes; i++){
        textoListaUl.innerHTML+= "<li class= 'elementoListaSubredes'>" +
        arreglo_Direcciones_deRed[i] + " - " + 
        arregloMascaras[i] +  " - " +
        (arreglo_ips_Subred_Potencia[i]-2) + " IP's asignables" +
        "</li>";

    }
}

/*---------------------CALCULA LAS DIRECCIONES DE RED, MASCARAS Y CANTIDAD DE IPS POR HOST------------------------------
-----------------------Y LAS ALMACENA EN DISTINTOS ARREGLOS CON LONGITUD= CANTIDAD SUBREDES---------------------------*/
function direcciones_mascaras_Subredes(){
    //define un exponente de 2 hasta superar la cantidad de ips requeridas
    var valorExponente= 0;
    var valorTotal= 2;

    //-----------------------------------------------------define las MASCARAS por subred en un arreglo--------------------------------------------------------------------//
    for (var i= 0; i<cantidadSubredes; i++){
        //llena el arreglo de ips por subred con los inputs agregados en la página
        var cantidad_ipsAux_porSubred= document.getElementById("inputSubred" + (i+1)).value;
        arreglo_ips_Subred.push(parseInt(cantidad_ipsAux_porSubred));
        
        //define una base, y un exponente incremental según avance el ciclo del while posterior
        valorExponente= 0;
        valorTotal= 2;

        //se repetirá hasta que el producto de 2 supere las ips de cada subred
        while (valorTotal< arreglo_ips_Subred[i]){
            valorTotal= Math.pow(2, valorExponente);
            
            //una vez sea mayor, añadirá a un string 32 dígitos, ya sea 1 o 0 (los puntos cuenta en el contéo de ciclos)
            if (valorTotal> arreglo_ips_Subred[i]){
                var creacionMascara= "";
                for (let j= 0; j< 32; j++){
                    //crea y almacena la máscara en DECIMAL
                    if(j< (32 - valorExponente)){
                        if(j== 0){
                            creacionMascara+= "1";
                        }
                        else {
                            if(j%8== 0){
                                creacionMascara+= "." + "1";
                            } else {
                                creacionMascara+= "1";
                            }   
                        }
                    } else {
                            if(j%8== 0){
                                creacionMascara+= "." + "0";
                            } else {
                                creacionMascara+= "0";
                            }   
                    }


                }
                arregloMascaras.push(creacionMascara);
            }
            
            valorExponente++;
        }

        let cantidad_Mascaras= document.getElementById("");
        arregloMascaras.push();
    }
        
    //-----------------------------------------------------define las IPS POR SUBRED por subred en un arreglo-----------------------------------------------------------------//
    for (let i= 0; i<cantidadSubredes; i++){

        //misma metodología que para calcular las máscaras
        valorExponente= 0;
        valorTotal= 2;

        while(valorTotal< (arreglo_ips_Subred[i] + 2)){
            valorTotal= Math.pow(2, valorExponente);

            //una vez sea mayor, se añade el valor alcanzado de las potencias de dos al arreglo de ips por subred en potencia
            if (valorTotal> arreglo_ips_Subred[i]+2){
                arreglo_ips_Subred_Potencia.push(parseInt(valorTotal));
            }

            valorExponente++;
        }

    }

    arreglo_Direcciones_deRed.push(direccionBase);

    /*A partir de aquí, es para definir las DIRECCIONES DE RED de cada subred en un arreglo separado por "." para definir 
    acorde a los ciclos posteriores--------------------------------------------------------------------------------------*/
    direccion_conSplit= direccionBase.split('.');
    direccion_conSplit_Int= [];

    //CONVIERTE CADA OCTETO de string a int
    for (let i= 0; i< 4; i++){
        direccion_conSplit_Int.push(parseInt(direccion_conSplit[i]));
    }

    //aumenta de uno en uno a partir del cuarto octeto, si llega a 255, suma 1 al octeto izquierdo y vuelve a iniciar en 0
    contadorAux= 1;
    for (let i= 0; i< arreglo_ips_Subred_Potencia.length; i++){
        for(let j= 0; j< arreglo_ips_Subred_Potencia[i]; j++){
            //aquí sería repetir el proceso hasta el índice [0] para asegurar el cálculo en cascada
            if (direccion_conSplit_Int[3]!= 255){
                direccion_conSplit_Int[3]+= 1;

            } else{
                direccion_conSplit_Int[2]+= 1;
                direccion_conSplit_Int[3]= 0;

                if (direccion_conSplit_Int[2]== 255){
                    direccion_conSplit_Int[1]+= 1;
                    direccion_conSplit_Int[2]= 0;
                }
            }

        }

        //luego convierte los arreglos de nuevo a string para agregarlos al arreglo que almacena las direcciones de red
        let direccion_conSplit_Int_a_String= "";
        for (let k= 0; k<4; k++){
            if (k== 3){
                direccion_conSplit_Int_a_String+= direccion_conSplit_Int[k].toString(10);
            } else {
                direccion_conSplit_Int_a_String+= direccion_conSplit_Int[k].toString(10) + ".";
            }
        }

        arreglo_Direcciones_deRed.push(direccion_conSplit_Int_a_String);

    }

}

/*------------------------------RETORNA LA PÁGINA y los valores al estatus inicial--------------------------------------*/
function reiniciar (){
    document.getElementById("ips_Subredes").innerHTML= "";
    document.getElementById("inputDireccion").value= null;
    document.getElementById("cantidadSubredes").value= null;
    document.getElementById("id-listaRedesCalculadas").innerHTML= "";

    arregloMascaras= [];
    arreglo_ips_Subred= [];
    arreglo_ips_Subred_Potencia= [];

    cantidadIngresada= 0;
    cantidadPedida= 0;

    botonCalcular.disabled= true;
    botonReiniciar.disabled= true;
}

/*---------------------CONVIERTE ENTEROS A BINARIOS para ayudar en ciertos bloques (línea 107)---------------------------*/
function convertir_Decimal_a_Binario (numero) {
    let numAux = numero;
    let binarioAux = (numAux % 2).toString();
    for (; numAux > 1; ) {
        numAux = parseInt(numAux / 2);
        binarioAux =  (numAux % 2) + (binarioAux);
    }

    return binarioAux;
}

/*-----------------------CONVIERTE BINARIOS A ENTEROS solo para confirmaciones en consola--------------------------------*/
function convertir_Binario_a_Decimal (numero){
    console.log(Number.parseInt(numero, 2));
}