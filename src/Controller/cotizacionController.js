/*
- @description: 		Archivo que filtra que tipo de cotizacion esta solicitando el webClient:
                            -Individual (solo por cantidad de paneles e inversores)
                            -BajaTensión
                            -Media tensión
- @author: 				LH420
- @date: 				20/03/2020
*/
const bajaTension = require('../Controller/bajaTensionController');
const mediaTension = require('../Controller/mediaTensionController');
const configFile = require('../Controller/configFileController');

var oldPanelPrice = 0;
var newPanelPrice = 0;
var oldInversorPrice = 0;
var newInversorPrice = 0;
var objCombinacion = {
    panel:{ idPanel:0, nombrePanel:'', marcaPanel:'', potenciaPanel:'', cantidadPaneles:0, potenciaReal:0, costoDeEstructuras:0, precioPorWatt:0, costoTotalPaneles:0 }, 
    inversor:{ idInversor:0, nombreInversor:'', marcaInversor:'', potenciaInversor:0, potenciaNominalInversor:0, precioInversor:0, potenciaMaximaInversor:0, numeroDeInversores:0, potenciaPicoInversor:0, porcentajeSobreDimens:0, costoTotalInversores:0 }
};


/*#region SwitchCotizaciones*/
/*#endregion*/
/*#region Busqueda_inteligente*/
module.exports.mainBusqInteligente = async function(data){
    const result = await mainBusquedaInteligente(data);
    return result;
}

async function mainBusquedaInteligente(data){
    var tipoCotizacion = data.tipoCotizacion;
    var _paneles = [];
    var newData = {};
    var objCombinaciones = {};
    var __combinaciones = [];
    
    if(tipoCotizacion == 'bajaTension'){
        _paneles = await bajaTension.firstStepBT(data);
        newData = {_paneles: _paneles, origen: data.origen, destino: data.destino};

        __combinacionMediana = await getCombinacionMediana(newData);
        __combinacionEconomica = await getCombinacionEconomica(newData);
        //__combinacionOptima = await getCombinacionOptima(newData);
    }
    /* else{

    } */

    objCombinaciones = {
        combinacionMediana: __combinacionMediana,
        combinacionEconomica: __combinacionEconomica
    };

    __combinaciones.push(objCombinaciones);

    return __combinaciones;
}

/*#region Combinaciones*/
async function getCombinacionEconomica(data){
    var __paneles = data._paneles || null;
    var newData = {};
    var _combinacionEconomica = [];

    if(__paneles.length > 0){
        for(var i=1; i<__paneles.length; i++)
        {
            newPanelPrice = parseFloat(__paneles[i].panel.costoTotalPaneles);
            
            if(i === 1){
                oldPanelPrice = newPanelPrice;
            }
            else if(oldPanelPrice >= newPanelPrice){
                oldPanelPrice = 0;
                oldPanelPrice += newPanelPrice;
                
                objCombinacion.panel.idPanel = __paneles[i].panel.idPanel;
                objCombinacion.panel.nombrePanel = __paneles[i].panel.nombre;
                objCombinacion.panel.marcaPanel = __paneles[i].panel.marca;
                objCombinacion.panel.potenciaPanel = __paneles[i].panel.potencia;
                objCombinacion.panel.cantidadPaneles = __paneles[i].panel.noModulos;
                objCombinacion.panel.potenciaReal = __paneles[i].panel.potenciaReal;
                objCombinacion.panel.costoDeEstructuras = __paneles[i].panel.costoDeEstructuras;
                objCombinacion.panel.precioPorWatt = __paneles[i].panel.costoPorWatt;
                objCombinacion.panel.costoTotalPaneles = __paneles[i].panel.costoTotalPaneles;
            }
        }
    }

    var __inversores = await bajaTension.obtenerInversores_Requeridos(objCombinacion.panel);

    if(__inversores.length > 0){
        for(var j=0; j<__inversores.length; j++)
        {
            newInversorPrice = parseFloat(__inversores[j].precioTotalInversores);

            if(j === 0){
                oldInversorPrice = newInversorPrice;
            }
            else if(oldInversorPrice <= newInversorPrice){
                oldInversorPrice = 0;
                oldInversorPrice += newInversorPrice;

                objCombinacion.inversor.idInversor = __inversores[j].idInversor;
                objCombinacion.inversor.nombreInversor = __inversores[j].nombreInversor;
                objCombinacion.inversor.marcaInversor = __inversores[j].marcaInversor;
                objCombinacion.inversor.potenciaInversor = __inversores[j].potenciaInversor;
                objCombinacion.inversor.potenciaNominalInversor = __inversores[j].potenciaNominalInversor;
                objCombinacion.inversor.precioInversor = __inversores[j].precioInversor;
                objCombinacion.inversor.potenciaMaximaInversor = __inversores[j].potenciaMaximaInversor;
                objCombinacion.inversor.numeroDeInversores = __inversores[j].numeroDeInversores;
                objCombinacion.inversor.potenciaPicoInversor = __inversores[j].potenciaPicoInversor;
                objCombinacion.inversor.porcentajeSobreDimens = parseFloat(__inversores[j].porcentajeSobreDimens);
                objCombinacion.inversor.costoTotalInversores = __inversores[j].precioTotalInversores;
            }
        }
    }
    
    _combinacionEconomica.push(objCombinacion);
    
    newData = {
        arrayBTI: _combinacionEconomica,
        origen: data.origen,
        destino: data.destino
    };

    ///Se calculan viaticos
    _combinacionEconomica = await bajaTension.obtenerViaticos_Totales(newData);

    return _combinacionEconomica;
}

async function getCombinacionMediana(data){//Mediana
    var __paneles = data._paneles || null;
    var __inversores = data._inversores || null;
    var _panelesSelectos = [];
    var _combinacionMediana = [];

    var marcaEspecificaPanel = await configFile.getArrayOfConfigFile();
    marcaEspecificaPanel = marcaEspecificaPanel.busqueda_inteligente.combinacionMediana_marcaEspecificaPanel.toString();

    if(__paneles.length > 0){
        //Se seleccionan paneles de la marcaEspecifica
        for(var i=1; i<__paneles.length; i++)
        {
            if(__paneles[i].panel.marca.toString() === marcaEspecificaPanel){
                _panelesSelectos.push(__paneles[i].panel);
            }
        }
        
        //Se selecciona el panel mas caro
        for(var x=0; x<_panelesSelectos.length; x++)
        {
            newPanelPrice = parseFloat(_panelesSelectos[x].costoTotalPaneles);

            if(x === 0){
                oldPanelPrice = parseFloat(_panelesSelectos[x].costoTotalPaneles);
            }
            else if(oldPanelPrice >= newPanelPrice){
                oldPanelPrice = 0;
                oldPanelPrice += newPanelPrice;
                
                objCombinacion.panel.idPanel = __paneles[x].panel.idPanel;
                objCombinacion.panel.nombrePanel = __paneles[x].panel.nombre;
                objCombinacion.panel.marcaPanel = __paneles[x].panel.marca;
                objCombinacion.panel.potenciaPanel = __paneles[x].panel.potencia;
                objCombinacion.panel.cantidadPaneles = __paneles[x].panel.noModulos;
                objCombinacion.panel.potenciaReal = __paneles[x].panel.potenciaReal;
                objCombinacion.panel.costoDeEstructuras = __paneles[x].panel.costoDeEstructuras;
                objCombinacion.panel.precioPorWatt = __paneles[x].panel.costoPorWatt;
                objCombinacion.panel.costoTotalPaneles = __paneles[x].panel.costoTotalPaneles;
            }
        }
    }

    var __inversores = await bajaTension.obtenerInversores_Requeridos(objCombinacion.panel);

    if(__inversores.length > 0){
        //Se selecciona el inversor mas barato
        for(var j=0; j<__inversores.length; j++)
        {
            newInversorPrice = parseFloat(__inversores[j].precioTotalInversores);

            if(j === 0){
                oldInversorPrice = newInversorPrice;
            }
            else if(oldInversorPrice >= newInversorPrice){
                oldInversorPrice = 0;
                oldInversorPrice += newInversorPrice;

                objCombinacion.inversor.idInversor = __inversores[j].idInversor;
                objCombinacion.inversor.nombreInversor = __inversores[j].nombreInversor;
                objCombinacion.inversor.marcaInversor = __inversores[j].marcaInversor;
                objCombinacion.inversor.potenciaInversor = __inversores[j].potenciaInversor;
                objCombinacion.inversor.potenciaNominalInversor = __inversores[j].potenciaNominalInversor;
                objCombinacion.inversor.precioInversor = __inversores[j].precioInversor;
                objCombinacion.inversor.potenciaMaximaInversor = __inversores[j].potenciaMaximaInversor;
                objCombinacion.inversor.numeroDeInversores = __inversores[j].numeroDeInversores;
                objCombinacion.inversor.potenciaPicoInversor = __inversores[j].potenciaPicoInversor;
                objCombinacion.inversor.porcentajeSobreDimens = parseFloat(__inversores[j].porcentajeSobreDimens);
                objCombinacion.inversor.costoTotalInversores = __inversores[j].precioTotalInversores;
            }
        }
    }
    
    _combinacionMediana.push(objCombinacion);
    
    newData = {
        arrayBTI: _combinacionMediana,
        origen: data.origen,
        destino: data.destino
    };

    ///Se calculan viaticos
    _combinacionMediana = await bajaTension.obtenerViaticos_Totales(newData);

    return _combinacionMediana;
}

async function getCombinacionOptima(data){//MayorProduccion
    var __paneles = data._paneles || null;
    var __inversores = data._inversores || null;
    var _combinacionOptima = [];
    var objCombinacionOptima = {};

    if(__paneles != null){

    }
    else if(__inversores != null){

    }
    else{
        return -1;
    }
}
/*#endregion*/
/*#endregion*/