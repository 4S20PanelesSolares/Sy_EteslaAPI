/*
- @description: 	Archivo de rutas, se recibe todo lo externo para su manejo dentro del servidor.
- @author: 			Yael Ramirez Herrerias / Jesus Daniel Carrera Fálcon
- @date: 			20/02/2020
*/

const express = require('express');
const router = express.Router();
const usuarioBL = require('../BL/usuarioBL');
const inversorBL = require('../BL/inversorBL');
const panelBL = require('../BL/panelesBL');
const clienteBL = require('../BL/clienteBL');
const vendedor_clienteBL = require('../BL/vendedor_clienteBL');
const mediaTensionController = require('../Controller/mediaTensionController');

router.use(express.json());

/*
- @section: 		Rutas para la sección de usuarios.
*/

router.post('/agregar-usuario', function (request, response) {
	usuarioBL.insertar(request.body)
	.then(usuario => {
		response.json({
			status: 200,
			message: usuario,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message
		});
	});
});

router.post('/validar-usuario', function (request, response) {
	usuarioBL.validar(request.body)
	.then(usuario => {
		response.json({
			status: 200,
			message: usuario
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message
		});
	});
});

/*
- @section: 		Rutas para la sección de inversores.
*/

router.get('/lista-inversores', function (request, response) {
	inversorBL.consultar()
	.then(inversor => {
		response.json(inversor);
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.post('/agregar-inversor', function (request, response) {
	inversorBL.insertar(request.body)
	.then(inversor => {
		response.json({
			status: 200,
			message: inversor,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.put('/eliminar-inversor', function (request, response) {
	inversorBL.eliminar(request.body)
	.then(inversor => {
		response.json({
			status: 200,
			message: inversor,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.put('/buscar-inversor', function (request, response) {
	inversorBL.buscar(request.body)
	.then(inversor => {
		response.json({
			status: 200,
			message: inversor,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.put('/editar-inversor', function (request, response) {
	inversorBL.editar(request.body)
	.then(inversor => {
		response.json({
			status: 200,
			message: inversor,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

/*
- @section: 		Rutas para la sección de paneles.
*/

router.get('/lista-paneles', function (request, response) {
	panelBL.consultar()
	.then(panel => {
		response.json(panel);
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.post('/agregar-panel', function (request, response) {
	panelBL.insertar(request.body)
	.then(panel => {
		response.json({
			status: 200,
			message: panel,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.put('/eliminar-panel', function (request, response) {
	panelBL.eliminar(request.body)
	.then(panel => {
		response.json({
			status: 200,
			message: panel,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.put('/buscar-panel', function (request, response) {
	panelBL.buscar(request.body)
	.then(panel => {
		response.json({
			status: 200,
			message: panel,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.put('/editar-panel', function (request, response) {
	panelBL.editar(request.body)
	.then(panel => {
		response.json({
			status: 200,
			message: panel,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

/*
- @section: 		Rutas para la sección de clientes.
*/

router.post('/agregar-cliente', function (request, response) {
	clienteBL.insertar(request.body)
	.then(cliente => {
		response.json({
			status: 200,
			message: cliente,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.put('/eliminar-cliente', function (request, response) {
	clienteBL.eliminar(request.body)
	.then(cliente => {
		response.json({
			status: 200,
			message: cliente,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.put('/editar-cliente', function (request, response) {
	clienteBL.editar(request.body)
	.then(cliente => {
		response.json({
			status: 200,
			message: cliente,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.get('/lista-clientes', function (request, response) {
	clienteBL.consultar()
	.then(cliente => {
		response.json(cliente);
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.put('/lista-clientes-id', function (request, response) {
	clienteBL.consultarId(request.body)
	.then(cliente => {
		response.json({
			status: 200,
			message: cliente,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.put('/lista-clientes-usuario', function (request, response) {
	clienteBL.consultarUser(request.body)
	.then(cliente => {
		response.json({
			status: 200,
			message: cliente,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

/*
- @section: 		Rutas para la sección de vendedores/clientes.
*/

router.post('/actualizarVendedorCliente', function (request, response) {
    const vendedor_clienteModel = {
        id_Usuario: request.body.id_Usuario,
		id_Cliente: request.body.id_Cliente
	};

	vendedor_clienteBL.actualizar(vendedor_clienteModel)
	.then(vendedor_cliente => {
		response.json({
			status: 200,
			message: "Se ha actualizado correctamente la relación del usuario con el cliente."
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message
		});
	});
});

/*
- @section: 		Rutas para la sección de media tensión.
*/
//--------------------------------------------------
router.post('/promedioArray', function (request, response) {
	mediaTensionBL.promedioArray(request.body)
	.then(array => {
		response.json({
			status: 200,
			message: array,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.post('/sendPeriods', function(request){
	mediaTensionController.cotizarGDMTH(request.body);
});
//--------------------------------------------------

module.exports = router; 
/*Exportar la constate 'router' con el fin de que esta clase pueda 
  ser ocupada por las demas*/