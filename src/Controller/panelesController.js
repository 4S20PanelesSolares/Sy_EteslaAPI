/*
- @description: 		Archivo correspondiente a las funciones de la API con la BD.
- @author: 				Yael Ramirez Herrerias
- @date: 				19/02/2020
*/
const mysqlConnection = require('../../config/database');

function insertarBD (datas) {
	const { vNombreMaterialFot, vMarca, fPotencia, fPrecio, vTipoMoneda, fISC, fVOC, fVMP, created_at } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Panel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [0, null, vNombreMaterialFot, vMarca, fPotencia, fPrecio, vTipoMoneda, fISC, fVOC, fVMP, created_at, null, null], (error, rows) => {
			if (error) {
				const response = {
					status: false,
					message: error
				}

				resolve (response);
			} else {
				const response = {
					status: true,
					message: "El registro se ha guardado con éxito."
				}

				resolve(response);
			}
		});
  	});
}

function eliminarBD(datas) {
	const { idPanel, deleted_at } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Panel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [1, idPanel, null, null, null, null, null, null, null, null, null, null, deleted_at], (error, rows) => {
			if (error) {
				const response = {
					status: false,
					message: error
				}

				resolve (response);
			} else {
				const response = {
					status: true,
					message: "El registro se ha eliminado con éxito."
				}

				resolve(response);
			}
		});
  	});
}

function editarBD (datas) {
	const { idPanel, vNombreMaterialFot, vMarca, fPotencia, fPrecio, vTipoMoneda, fISC, fVOC, fVMP, updated_at } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Panel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [2, idPanel, vNombreMaterialFot, vMarca, fPotencia, fPrecio, vTipoMoneda, fISC, fVOC, fVMP, null, updated_at, null], (error, rows) => {
			if (error) {
				const response = {
					status: false,
					message: error
				}

				resolve (response);
			} else {
				const response = {
					status: true,
					message: "El registro se ha editado con éxito."
				}

				resolve(response);
			}
		});
  	});
}

function consultaBD () {
  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Panel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [3, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
			if (error) {
				const response = {
					status: false,
					message: error
				}

				resolve (response);
			} else {
				const response = {
					status: true,
					message: rows[0]
				}

				resolve(response);
			}
		});
  	});
}

function buscarBD (datas) {
	const { idPanel } = datas;
  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Panel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [4, idPanel, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
			if (error) {
				const response = {
					status: false,
					message: error
				}

				resolve (response);
			} else {
				const response = {
					status: true,
					message: rows[0]
				}

				resolve(response);
			}
		});
  	});
}
/*#region LH420*/
/*
- @description: 		Funciones para la cotizacion de media tension
- @author: 				LH420
- @date: 				01/04/2020
*/
const otrosMateriales = require('./otrosMaterialesController');

var objNoDeModulosPorPotenciaDelPanel = {};

async function numberOfModuls(powerNeeded, irradiation, efficiency, topeProduccion){
	var _potenciaRequeridaEnKwp = await getSystemPowerInKwp(powerNeeded, irradiation, efficiency, topeProduccion);
	// console.log('Potencia requerida en Kwp: '+_potenciaRequeridaEnKwp);
	var _potenciaRequeridaEnW = getSystemPowerInWatts(_potenciaRequeridaEnKwp);
	// console.log('Potencia requerida en Watts: '+_potenciaRequeridaEnW);
	var _arrayTodosPaneles = await getAllPanelsArray();
	_arrayObjectsNoOfModuls = await getArrayObjectsNoOfModuls(_arrayTodosPaneles,_potenciaRequeridaEnW);

	return _arrayObjectsNoOfModuls;
}

async function getAllPanelsArray(){
	consultaPaneles = await consultaBD();
	consultaPaneles = consultaPaneles.message;
	return consultaPaneles;
}

async function getArrayObjectsNoOfModuls(arrayAllOfPanels, energyRequiredInW){
	arrayNoDeModulosPorPotenciaDelPanel = [];

	for(var i = 0; i < arrayAllOfPanels.length; i++)
	{
		idPanel = arrayAllOfPanels[i].idPanel;
		_nombre = arrayAllOfPanels[i].vNombreMaterialFot;
		_marca = arrayAllOfPanels[i].vMarca
		_precio = arrayAllOfPanels[i].fPrecio;
		potenciaDelPanel = arrayAllOfPanels[i].fPotencia;
		NoOfModuls = Math.ceil(energyRequiredInW / potenciaDelPanel);
		structuresCost = await otrosMateriales.obtenerCostoDeEstructuras(NoOfModuls);
		_potenciaReal = (potenciaDelPanel * NoOfModuls)/1000;

		objNoDeModulosPorPotenciaDelPanel = {
			idPanel: idPanel,
			nombre: _nombre,
			marca: _marca,
			potencia: potenciaDelPanel,
			potenciaReal: _potenciaReal,
			noModulos: NoOfModuls,
			precioPorPanel: _precio,
			costoDeEstructuras: structuresCost
		};

		arrayNoDeModulosPorPotenciaDelPanel.push(objNoDeModulosPorPotenciaDelPanel);
	}
	return arrayNoDeModulosPorPotenciaDelPanel;
}

function getSystemPowerInWatts(powerRequired){
	potenciaRequeridaEnW = powerRequired * 1000;
	potenciaRequeridaEnW = parseFloat(Math.round(potenciaRequeridaEnW * 100) / 100).toFixed(2);
	return potenciaRequeridaEnW;
}

async function getSystemPowerInKwp(monthlyAvarageConsumption, irradiation, efficiency, topeProduccion){
	potenciaRequeridaEnKwp = monthlyAvarageConsumption / (irradiation * efficiency);
	potenciaRequeridaEnKwp = parseFloat(Math.round(potenciaRequeridaEnKwp * 100) / 100).toFixed(2);
	potenciaRequeridaEnKwp >= topeProduccion ? potenciaRequeridaEnKwp = topeProduccion : potenciaRequeridaEnKwp;
	return potenciaRequeridaEnKwp;
}

module.exports.numeroDePaneles = async function (potenciaNecesaria, irradiacion, eficiencia, topeProduccion){
	const result = await numberOfModuls(potenciaNecesaria, irradiacion, eficiencia, topeProduccion);

	return result;
}
/*#endregion*/

module.exports.insertar = async function (datas, response) {
	const result = await insertarBD(datas);

	return result;
}

module.exports.eliminar = async function (datas, response) {
	const result = await eliminarBD(datas);

	return result;
}

module.exports.buscar = async function (datas) {
	const result = await buscarBD(datas);

	return result;
}

module.exports.editar = async function (datas, response) {
	const result = await editarBD(datas);

	return result;
}

module.exports.consultar = async function (response) {
	const result = await consultaBD();

	return result;
}