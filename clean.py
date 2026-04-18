with open(r'c:\Desarrollo\Proyectos\nojochware\GrupoCCO\database.sql', 'rb') as f:
    content = f.read()

# Eliminar caracteres NUL generados por PowerShell / UTF-16
clean_content = content.replace(b'\x00', b'')

with open(r'c:\Desarrollo\Proyectos\nojochware\GrupoCCO\database.sql', 'wb') as f:
    f.write(clean_content)
print("Archivo database.sql limpiado correctamente.")
