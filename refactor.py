import re

# Leer el archivo HTML
with open('Characters.html', 'r', encoding='utf-8') as file:
    content = file.read()

# Expresión regular para encontrar y reemplazar los divs
pattern = re.compile(r'''
    <div\sclass="col-lg-3\scol-md-6\scol-sm-6\scol-6\smb-4"\sid="(\d+)"> # Coincide con el div contenedor, capturando el id
    \s*<div\sclass="card\sh-100\sshadow-sm">                             # Coincide con el div interno
    \s*<a\sclass="text-dark\stext-decoration-none"\shref="([^"]+)">     # Coincide con el link, capturando el href
    \s*<img\sclass="card-img-top"\ssrc="([^"]+)"/>                      # Coincide con la imagen, capturando el src
    \s*<div\sclass="card-body">                                         # Coincide con el div de card-body
    \s*<h5\sclass="card-title">(.*?)</h5>                               # Coincide con el h5, capturando su contenido
    \s*<p\sclass="card-text\stext-muted">(.*?)</p>                      # Coincide con el párrafo, capturando su contenido
    \s*</div>\s*</a>\s*</div>\s*</div>                                  # Cierra todos los divs
''', re.VERBOSE | re.DOTALL)

# Función para reemplazar cada coincidencia
def replace_card(match):
    card_id = match.group(1)
    href = match.group(2)
    img_src = match.group(3)
    h5_content = match.group(4).strip()  # Eliminar espacios en blanco alrededor
    p_content = match.group(5).strip()   # Eliminar espacios en blanco alrededor

    # Nueva estructura del div
    new_div = f'''
    <div class="col-lg-3 col-md-6 col-sm-6 col-6 mb-4" id="{card_id}">
        <div class="card h-100 shadow-sm position-relative">
            <a class="text-dark text-decoration-none" href="{href}">
                <img class="card-img-top" src="{img_src}"/>
                <div class="card-body d-flex justify-content-between align-items-center">
                    <div>
                        <h5 class="card-title">{h5_content}</h5>
                        <p class="card-text text-muted">{p_content}</p>
                    </div>
                    <div class="rankImg d-flex flex-column align-items-end"></div>
                </div>
            </a>
        </div>
    </div>
    '''
    return new_div

# Reemplazar todas las coincidencias en el contenido
new_content = pattern.sub(replace_card, content)

# Guardar el archivo modificado
with open('Characters_modified.html', 'w', encoding='utf-8') as file:
    file.write(new_content)

print("El archivo ha sido modificado y guardado como 'Characters_modified.html'.")
