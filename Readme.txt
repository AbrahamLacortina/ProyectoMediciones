# Monitoreo Ambiental

Aplicación web para visualizar y analizar mediciones ambientales (temperatura, humedad, PM2.5, PM10) en tiempo real y por rangos de fechas.

## Requisitos

- Java 17+
- Maven 3.8+
- Node.js 16+ y npm
- MySQL 8+

## Configuración de la Base de Datos

1. **Instala MySQL** y asegúrate de que el servicio esté corriendo.
2. Crea una base de datos y un usuario (ajusta el nombre y contraseña según tu preferencia):

   ```sql
   CREATE DATABASE monitoreo_ambiental;
   CREATE USER 'TU_USUARIO'@'localhost' IDENTIFIED BY 'TU_CONTRASEÑA';
   GRANT ALL PRIVILEGES ON monitoreo_ambiental.* TO 'TU_USUARIO'@'localhost';
   FLUSH PRIVILEGES;

   Configura las credenciales en src/main/resources/application.properties:


   spring.datasource.url=jdbc:mysql://localhost:3306/monitoreo_ambiental?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
   spring.datasource.username=TU_USUARIO
   spring.datasource.password=TU_CONTRASEÑA
   Cambia TU_USUARIO y TU_CONTRASEÑA por los datos de tu base de datos MySQL.


   Ejecución del Backend (Spring Boot)
   Compila y ejecuta el backend:


   mvn clean install
   mvn spring-boot:run
   El backend se inicia en http://localhost:8080.


   Ejecución del Frontend (React)
   Ve al directorio del frontend (por ejemplo, monitoreo-ambiental-web):


   cd monitoreo-ambiental-web
   Instala las dependencias:


   npm install
   Inicia la app:


   npm start
   La app estará disponible en http://localhost:3000.


   Uso
   Accede a la app en tu navegador.
   Usa el menú lateral para ver mediciones o gráficos.
   Filtra por estación, rango de fechas y tópico.
   Los datos se almacenan y consultan desde la base de datos MySQL configurada.
   Notas
   El backend se conecta a un broker MQTT público para recibir datos en tiempo real.
   Puedes modificar los tópicos MQTT y la configuración en application.properties.