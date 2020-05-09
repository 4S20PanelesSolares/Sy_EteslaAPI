DELIMITER //
CREATE PROCEDURE SP_Usuario
(
    /* Variables para Usuario */
    IN Opcion INT,
    IN xIdUsuario VARCHAR(255),
    IN xId_Persona VARCHAR(255),
    IN Rol SMALLINT,
    IN TipoUsuario TINYTEXT,
    IN Contrasenia VARCHAR(255),
    IN Oficina VARCHAR(20),
        /* Variable para Persona */
    IN xIdPersona VARCHAR(255),
    IN NombrePersona VARCHAR(50),
    IN PrimerApellido VARCHAR(50),
    IN SegundoApellido VARCHAR(50),
    IN Telefono VARCHAR(13),
    IN Celular VARCHAR(13),
    IN Email VARCHAR(60),
    IN created TIMESTAMP,
    IN updated TIMESTAMP,
    IN deleted TIMESTAMP
)
BEGIN
    /* Insertar nueva Persona y Usuario  */
    IF (Opcion = 0) THEN
        INSERT INTO persona
        VALUES (UUID(), NombrePersona, PrimerApellido, SegundoApellido, Telefono, Celular, Email, created, updated, deleted);
        SET xId_Persona = (SELECT HEX(idPersona) AS idPersona FROM persona WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 1);
        INSERT INTO usuario
        VALUES (UUID(), UNHEX(xId_Persona), Rol, TipoUsuario, AES_ENCRYPT(Contrasenia, 'EteslaPanelesSolares'), Oficina);
    /* Eliminar Usuario */
    ELSEIF (Opcion = 1) THEN
        UPDATE persona
        SET deleted_at = deleted
        WHERE idPersona = UNHEX(xIdPersona);
    /* Editar Usuario */
    ELSEIF (Opcion = 2) THEN
        UPDATE usuario
        INNER JOIN persona ON usuario.id_Persona = persona.idPersona
        SET persona.vNombrePersona = NombrePersona, persona.vPrimerApellido = PrimerApellido, persona.vSegundoApellido = SegundoApellido,
        usuario.vOficina = Oficina, usuario.vContrasenia = AES_ENCRYPT(Contrasenia, 'EteslaPanelesSolares'), persona.updated_at = updated
        WHERE persona.idPersona = UNHEX(xIdPersona) AND persona.deleted_at IS NULL;

        SELECT HEX(usuario.idUsuario) AS idUsuario, usuario.siRol, usuario.ttTipoUsuario, 
        HEX(usuario.vContrasenia) AS vContrasenia, usuario.vOficina,
        HEX(persona.idPersona) AS idPersona, persona.vNombrePersona, persona.vPrimerApellido, persona.vSegundoApellido, 
        persona.vTelefono, persona.vCelular, persona.vEmail, persona.created_at, persona.updated_at
        FROM usuario
        INNER JOIN persona ON usuario.id_Persona = persona.idPersona
        WHERE persona.idPersona = UNHEX(xIdPersona) AND persona.deleted_at IS NULL;
    /* Consultar todos los registros de Usuario */
    ELSEIF (Opcion = 3) THEN
        SELECT HEX(usuario.idUsuario) AS idUsuario, usuario.siRol, usuario.ttTipoUsuario, 
        AES_DECRYPT(usuario.vContrasenia,'EteslaPanelesSolares') AS vContrasenia, usuario.vOficina,
        HEX(persona.idPersona) AS idPersona, persona.vNombrePersona, persona.vPrimerApellido, persona.vSegundoApellido, 
        persona.vTelefono, persona.vCelular, persona.vEmail, persona.created_at, persona.updated_at
        FROM usuario
        INNER JOIN persona ON usuario.id_Persona = persona.idPersona
        WHERE persona.deleted_at IS NULL;
    /* Validar el usuario */
    ELSEIF (Opcion = 4) THEN
        SELECT HEX(usuario.idUsuario) AS idUsuario, usuario.siRol, usuario.ttTipoUsuario, 
        HEX(usuario.vContrasenia) AS vContrasenia, usuario.vOficina,
        HEX(persona.idPersona) AS idPersona, persona.vNombrePersona, persona.vPrimerApellido, persona.vSegundoApellido, 
        persona.vTelefono, persona.vCelular, persona.vEmail, persona.created_at, persona.updated_at
        FROM usuario
        INNER JOIN persona ON usuario.id_Persona = persona.idPersona
        WHERE persona.vEmail = Email AND usuario.vContrasenia = AES_ENCRYPT(Contrasenia, 'EteslaPanelesSolares') AND persona.deleted_at IS NULL;
    /* Recuperar la contrasenia del usuario mediante su correo */
    ELSEIF (Opcion = 5) THEN
        SELECT AES_DECRYPT(usuario.vContrasenia,'EteslaPanelesSolares') AS vContrasenia
        FROM usuario
        INNER JOIN persona ON usuario.id_Persona = persona.idPersona
        WHERE persona.vEmail = Email AND persona.deleted_at IS NULL;
    /* Leer - filtrado */
    ELSEIF (Opcion = 6) THEN
        SELECT HEX(usuario.idUsuario) AS idUsuario, usuario.siRol, usuario.ttTipoUsuario, AES_DECRYPT(usuario.vContrasenia,'EteslaPanelesSolares') AS vContrasenia, usuario.vOficina,
        HEX(persona.idPersona) AS idPersona, persona.vNombrePersona, persona.vPrimerApellido, persona.vSegundoApellido, persona.vTelefono, persona.vCelular, persona.vEmail, persona.created_at, persona.updated_at
        FROM usuario
        INNER JOIN persona ON usuario.id_Persona = persona.idPersona
        WHERE persona.deleted_at IS NULL AND persona.idPersona = UNHEX(xIdPersona);
    /* Verificar email */
    ELSEIF (Opcion = 7) THEN
        UPDATE persona
        SET vTelefono = NULL
        WHERE vEmail = Email AND deleted_at IS NULL;
    END IF;
END
// DELIMITER ;