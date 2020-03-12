/*
- @description:         Archivo de reglas, para el acceso a la capa de datos. Validaciones de datos 
- @author:              Yael Ramirez Herrerias
- @date:                19/02/2020
*/

// Instancia a la libreria de validaciones.
const yup = require('yup');

// Variable constante, contendrá los mensajes personalizados para cada tipo de validación creada.
const message = {
    string: ' debe ser una cadena de caracteres.',
    letter: ' debe contener solo caracteres alfabéticos.',
    required: ' es obligatorio.',
    number: ' debe contener solo caracteres numéricos.',
    int: ' debe contener valores enteros.'
}

// Función de validación. Se establecen las reglas que se requieren por campo, utilizando la librería "yup"
function clientevendedorValidation (data) {
    const schema = yup.object().shape({
        idUsuario: yup
            .string(message.string)
            .required(message.required),
        idCliente: yup
            .string(message.string)
            .required(message.required),
    });

    // Retornamos los resultados mediante una promesa, incluyendo los mensajes o resultados.
    return new Promise((resolve, reject) => {
        yup
        .reach(schema)
        .validate(data)
        .then(function (data) {
            const response = {
                status: true,
                message: data
            }

            resolve(response);
        })
        .catch(function (error) {
            const response = {
                status: false,
                message: error.path + error.message
            }

            resolve(response);
        });
    });
}

// Exportamos la función para el uso de la misma en otros archivos.
module.exports = {
    clientevendedorValidation,
};