## Test the node js backend using browser
1. run the following command in `system_test/application` folder to create a .p12 file   
`openssl pkcs12 -export -clcerts -inkey key.pem -in cert.pem -out MyPKCS12.p12 -name "Your Name"`  

2. Add MyPKCS12.p12 file into the key chain.   
(1) Open `Settings` of chrome, and open `Manage Certificates`    
(2) This will open the `Keychain Access` window in Mac. Go to `file`, then `import items`. Choose `MyPKCS12.p12` you just created, and set a password for it.  

3. Add the server cert   
(1) Import cert.pem in current folder (same process as that in step 2)   
(2) Double click the newly added cert (in `certificates` in Keychain Access window), expand `Trust`, and mark it as `always trust` 

4. Open chrome and access type `https://localhost:8433` in address bar, and choose `localhost` certificate when prompted.  
