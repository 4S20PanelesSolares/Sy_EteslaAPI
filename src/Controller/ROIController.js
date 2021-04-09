module.exports.obtenerROI = async function getROI(objPower, _consums, costoProyectoMXN){
    let costoKwh = 5; //Pesos MXN
    let tarifa = objPower.dac_o_nodac; //dac o no dac - tarifas
    let consumoAnual = parseFloat(_consums._promCons.consumoAnual); //*KWH*
    let generacionAnual = 0; //*KWp* 
    let costoDeProyecto = costoProyectoMXN; //CostoProyectoMXN con IVA

    if(objPower.generacion.generacionAnualMwh){
        generacionAnual = objPower.generacion.produccionAnualKwh;
    }
    else{
        generacionAnual = objPower.generacion.generacionAnual;
    }
  
    /*$$ - Pago a CFE y Ahorro(s)*/
    ///Pago a CFE
    consumoAnualPesosMXN = consumoAnual * costoKwh;
    consumoBimestralPesosMXN = consumoAnualPesosMXN / 6;
    consumoMensualPesosMXN = consumoAnualPesosMXN / 12;
    ///
    generacionAnualPesosMXN = Math.round((generacionAnual * costoKwh) * 100)/100; //(generacionAnual_kwh) * costoKwh
    ROIenAnios = Math.round((costoDeProyecto / generacionAnualPesosMXN) * 100) / 100;

    ahorroAnual = Math.round((consumoAnual - generacionAnual) * 100)/100; //kwh

    /*$$ - Nuevo pago a CFE*/
    nuevoPagoAnual = Math.round((ahorroAnual * 1.5) * 100) / 100;
    nuevoPagoBimestral = Math.round((nuevoPagoAnual / 6) * 100)/100;

    /*Ahorro (energia/$$)*/
    
    /*#region Hipotesis_aboutROI*/
    ahorroAnualEnPesosMXN = Math.round((ahorroAnual * costoKwh) * 100)/100; //$$
    ahorroBimestralEnPesosMXN = Math.round((ahorroAnualEnPesosMXN / 6) * 100)/100; //$$
    ahorroMensualEnPesosMXN = Math.round(((consumoBimestralPesosMXN - nuevoPagoBimestral) / 2) * 100) / 100; //$$
    /*#endregion*/

    objRespuesta = {
        ahorro: {
            ahorroAnualEnPesosMXN: ahorroAnualEnPesosMXN,
            ahorroBimestralEnPesosMXN: ahorroBimestralEnPesosMXN,
            ahorroMensualEnPesosMXN: ahorroMensualEnPesosMXN
        },
        consumo: {
            consumoAnualPesosMXN: consumoAnualPesosMXN,
            consumoBimestralPesosMXN: consumoBimestralPesosMXN,
            consumoMensualPesosMXN: consumoMensualPesosMXN
        },
        generacion: {
            generacionAnualPesosMXN: generacionAnualPesosMXN,
            nuevoPagoAnual: nuevoPagoAnual,
            nuevoPagoBimestral: nuevoPagoBimestral
        },
        roiEnAnios: ROIenAnios
    };

    return objRespuesta;
}