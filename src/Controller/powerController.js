/* function mainPower(_arrayCotizacion, _porcentajePerdida, data){
    getProduccionSolarIntermedia(_arrayCotizacion, _porcentajePerdida, data);
} */

function getIrradiacionDiasDeMesesDelAnio(){
    var objMeses = {};

    objMeses = {
        enero: {dias: 31, irradiacion: 3.65},
        febrero: {dias: 28, irradiacion: 4.23},
        marzo: {dias: 31, irradiacion: 4.86},
        abril: {dias: 30, irradiacion: 5.35},
        mayo: {dias: 31, irradiacion: 5.46},
        junio: {dias: 30, irradiacion: 5.07},
        julio: {dias: 31, irradiacion: 5.27},
        agosto: {dias: 31, irradiacion: 5.05},
        septiembre: {dias: 30, irradiacion: 4.46},
        octubre: {dias: 31, irradiacion: 4.29},
        noviembre: {dias: 30, irradiacion: 3.95},
        diciembre: {dias: 31, irradiacion: 3.55}
    }

    /*
    NOTA: La propiedad de 'irradiacion' del objeto 'objMeses' debe de ser dinamica y esta tiene que ser obtenida por datos de la API de la NASA
    */
    objMeses = Object.values(objMeses);

    return objMeses;
}

/*#region Datos_Consumo*/
module.exports.getCD_DatosConsumo_ = async function(data){
    const res = await getCD_DatosConsumo(data);
    return res;
}

module.exports.getProduccionIntermedia_ = async function(data){
    const res = await getProduccionIntermedia(data);
    // return res;
}

//1er. Paso:
async function getCD_DatosConsumo(data){
    var objCD = { C:0, D:0 };
    var C = 0;
    var D = 0;
    arrayMeses_ = getIrradiacionDiasDeMesesDelAnio();

    var arrayCD = [];

    for(var i=0; i<data.arrayPeriodosGDMTH.length; i++)
    {
        var bkwh = Number.parseFloat(data.arrayPeriodosGDMTH[i].bkwh);
        var ikwh = Number.parseFloat(data.arrayPeriodosGDMTH[i].ikwh);
        var pkwh = Number.parseFloat(data.arrayPeriodosGDMTH[i].pkwh);
        var bkw = Number.parseFloat(data.arrayPeriodosGDMTH[i].bkw);
        var ikw = Number.parseFloat(data.arrayPeriodosGDMTH[i].ikw);
        var pkw = Number.parseFloat(data.arrayPeriodosGDMTH[i].pkw);
        var dias = arrayMeses_[i].dias;
        
        C = Math.min(pkw, ((bkwh + ikwh + pkwh)/(24 * dias * 0.52)), ((bkwh + ikwh + pkwh)/(24 * dias * 0.52)));
        D = Math.min(Math.max(bkw, ikw, pkw),((bkwh + ikwh + pkwh)/(24 * dias * 0.52)));

        console.log('C: '+C+'\nD: '+D);
        console.log('-----------------------------');

        objCD = {
            C: C,
            D: D
        }

        arrayCD.push(objCD);
    }
    
    getProduccionIntermedia(data, arrayCD)

}
/*#endregion*/

/*#region Produccion Solar*/
function getProduccionBase(){
    var produccionBase = 0;
    return produccionBase;
}

function getProduccionPunta(){
    var produccionPunta = 0;
    return produccionPunta;
}

//2do. paso (2.1) /*Start [este deberia de ser el primer paso]*/
async function getProduccionIntermedia(data, arrayCD){ //La data debera traer como dato extra "potenciaReal" y "porcentajeDePerdida"
    var produccionIntermedia = 0;
    var __produccionIntermedia = [];
    potenciaReal = data.potenciaReal;
    porcentajePerdida = parseFloat((data.porcentajePerdida)/100);
    arrayMeses_ = getIrradiacionDiasDeMesesDelAnio();

    for(var i=0; i<arrayMeses_.length; i++)
    {
        diasMes = arrayMeses_[i].dias;
        irradicionMes = arrayMeses_[i].irradiacion;

        produccionIntermedia = potenciaReal * irradicionMes * diasMes * (1 - porcentajePerdida);
        produccionIntermedia = Math.round(produccionIntermedia);
        __produccionIntermedia.push(produccionIntermedia);
    }
    console.log('getProduccionIntermedia() says: ');
    console.log(__produccionIntermedia);

    getBIP_DespuesDeSolar(data, arrayCD, __produccionIntermedia);
}

/*#endregion*/

/*#region Consumos Despues de Solar*/
//2do. paso (2.2)
function getBIP_DespuesDeSolar(data, _arrayCD, produccionIntermedia){
    arrayMeses_ = getIrradiacionDiasDeMesesDelAnio();
    var produccionBase = getProduccionBase();
    var produccionPunta = getProduccionPunta();
    var _newBIP = [];
    var newBIP = {
        newB: 0,
        newI: 0,
        newP: 0,
        newC: 0,
        newD: 0
    };

    var bkwh = 0;
    var ikwh = 0;
    var pkwh = 0;
    var bkw = 0;
    var ikw = 0;
    var pkw = 0;

    for(var i=0; i<data.arrayPeriodosGDMTH.length; i++)
    {
        bkwh = Number.parseFloat(data.arrayPeriodosGDMTH[i].bkwh);
        ikwh = Number.parseFloat(data.arrayPeriodosGDMTH[i].ikwh);
        pkwh = Number.parseFloat(data.arrayPeriodosGDMTH[i].pkwh);
        bkw = Number.parseFloat(data.arrayPeriodosGDMTH[i].bkw);
        ikw = Number.parseFloat(data.arrayPeriodosGDMTH[i].ikw);
        pkw = Number.parseFloat(data.arrayPeriodosGDMTH[i].pkw);
        
        var produccionIntermedia = produccionIntermedia[i];
        diasMes = arrayMeses_[i].dias;

        newB = bkwh - produccionBase;
        newI = ikwh - produccionIntermedia;
        newP = pkwh - produccionPunta;
        newC = Math.min(pkw, (newB + newI + newP) / (24 * diasMes * 0.57));
        newD = Math.min(Math.max(bkw, ikw, pkw), (newB + newI + newP) / (24 * diasMes * 0.57));
        
        newBIP = {
            newB: newB,
            newI: newI,
            newP: newP,
            newC: newC,
            newD: newD
        }

        _newBIP.push(newBIP);
    }

    console.log('getBIP_DespuesDeSolar says:\n'+_newBIP);

    getBIPMXN_kWh(data, arrayCD, _newBIP);
}
/*#endregion*/

/*#region Tarifas_CFE*/
//3er. Paso
function getBIPMXN_kWh(data, arrayCD, newBIP){
    var objBIPMXN_kwh = {};
    var _bipMXN_kWh = [];

    for(var i=0; i<data.arrayPeriodosGDMTH.length; i++)
    {
        var bkwh = parseFloat(data.arrayPeriodosGDMTH[i].bkwh);
        var ikwh = parseFloat(data.arrayPeriodosGDMTH[i].ikwh);
        var pkwh = parseFloat(data.arrayPeriodosGDMTH[i].pkwh);
        var bmxn = parseFloat(data.arrayPeriodosGDMTH[i].bmxn);
        var imxn = parseFloat(data.arrayPeriodosGDMTH[i].imxn);
        var pmxn = parseFloat(data.arrayPeriodosGDMTH[i].pmxn);
        var cmxn = parseFloat(data.arrayPeriodosGDMTH[i].cmxn);
        var dmxn = parseFloat(data.arrayPeriodosGDMTH[i].dmxn);

        var ckw = arrayCD[i].objCD.C;
        var dkw = arrayCD[i].objCD.D;

        var newB = newBIP[i].newB;
        var newI = newBIP[i].newI;
        var newP = newBIP[i].newP;

        bmxn_kwh = bmxn / bkwh;
        imxn_kwh = imxn / ikwh;
        pmxn_kwh = pmxn / pkwh;
        cmxn_kw = cmxn / ckw;
        dmxn_kw = dmxn / dkw;

        energiaFaltante = newB + newI + newP;

        objBIPMXN_kwh = {
            bmxn_kwh: bmxn_kwh,
            imxn_kwh: imxn_kwh,
            pmxn_kwh: pmxn_kwh,
            cmxn_kw: cmxn_kw,
            dmxn_kw: dmxn_kw,
            energiaFaltante: energiaFaltante
        }

        _bipMXN_kWh.push(objBIPMXN_kwh);
    }
    console.log('getBIPMXN_kWh:\n'+_bipMXN_kWh);

    getPagosTotales(data, _bipMXN_kWh, arrayCD, newBIP);
}
/*#endregion*/

/*#region Pagos_totales*/
//4to. paso
function getPagosTotales(data, bipMXN_kWh, arrayCD, newBIP){
    var objPagosTotales = {};
    /*#region SIN_SOLAR*/
    for(var i=0; i<data.arrayPeriodosGDMTH.length; i++)
    {
        objPagosTotales = {
            sinSolar: {
                energia:,
                capacidad:,
                distribucion:,
                iva:,
                total:
            }
        };
    }
    /*#endregion*/
    /*#region CON_SOLAR*/
    for(var j=0; j<data.arrayPeriodosGDMTH.length; j++)
    {
        objPagosTotales = {
            conSolar: {
                energia:,
                transimision:,
                capacidad:,
                distribucion:,
                iva:,
                total:
            }
        };
    }
    /*#endregion*/
}
/*#endregion*/

/*#region Celdas_Arriba(Radiacion, Produccion_Anual(kWh), Produccion_Anual(mWh), Total_SinSolar, Total_ConSolar, Ahorro, Porcentaje)*/
function getRadiacion(){
    var _arrayMeses = getIrradiacionDiasDeMesesDelAnio();
    var promedio = 0;
    var suma = 0;

    for(var i=0; i<_arrayMeses.length; i++){
        suma = suma + _arrayMeses[i].dias;
        promedio = promedio + _arrayMeses[i].irradiacion;
        promedio = i+1 === _arrayMeses.length ? promedio/_arrayMeses.length : promedio;
    }
    
    radiacion = Math.ceil(promedio * suma);
    return radiacion;
}
/*#endregion*/





/* module.exports.obtenerIrradiacionDiasMeses = function(){
    getRadiacion();
} */

// module.exports.mainPower = function(arrayCotizacion, porcentajePerdida, data){
//     mainPower(arrayCotizacion, porcentajePerdida, data);
// }

