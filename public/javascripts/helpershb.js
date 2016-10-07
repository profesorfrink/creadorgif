'use strict';

Handlebars.registerHelper('esTexto', function( index ) {
    if (typeof objetos !== 'undefined') {
        return objetos[index].tipo === 'texto';
    }
  
});
Handlebars.registerHelper('tieneFiltro', function (objetoImagen, index ) {
    var retorno = '';
    if ( objetoImagen.hasOwnProperty('filters')) {
        if ( objetoImagen.filters[index ]) {
            retorno = 'checked';
        }
    }
    return retorno;
});