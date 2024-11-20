$(document).ready(function () {
  loadTable();
});

function handleKeyPress(event) {
  //keycode 13 == enter
  if (event.keyCode === 13) {

    loadTableFilter();
  }
}

function loadTable() {
  var requestOptions = {
    method: 'GET',
    redirect: 'follow'
  };

  fetch("https://restcountries.com/v3.1/all", requestOptions)
    .then(response => response.text())
    .then(result => {
      var jResult = JSON.parse(result);
      createRows(jResult);
    })
    .catch(error => console.log('error', error));

}

function loadTableFilter(countryName) {

  var countryName = document.getElementById('paisID').value;

  console.log(countryName);
  if (countryName !== '') {
    var apiUrl = `https://restcountries.com/v3.1/name/${countryName}`;

    var requestOptions = {
      method: 'GET',
      redirect: 'follow'
    };

    fetch(apiUrl, requestOptions)
      .then(response => response.text())
      .then(result => {
        // clearTable();
        if (result !== '{"status":404,"message":"Not Found"}') {

        }
        var jResult = JSON.parse(result);
        createRows(jResult);
      })
      .catch(error => {
        console.log('error', error);
        loadTable();

        var mensaje = countryName ? `País encontrado: ${countryName}` : 'País no encontrado';

        document.getElementById('searchModalBodyID').innerHTML = `<p>${mensaje}</p>`;

        $('#searchModalID').modal('show');
      });
  } else {
    loadTable();
  }

}


function getCountryName(code) {
  var requestOptions = {
    method: 'GET',
    redirect: 'follow'
  };

  var url = "https://restcountries.com/v3.1/alpha/" + code;

  return fetch(url, requestOptions)
    .then(response => response.json())
    .then(result => {
      var countryName = result[0]?.name?.common;
      if (countryName) {
        return countryName;
      } else {
        throw new Error('No se pudo obtener el nombre del país.');
      }
    })
    .catch(error => {
      console.log('error', error);
      throw error; 
    });
}

function createRows(data) {
  var tableHtml = '';  

  /*Reset the table*/
  var table = $('#table1TableID').DataTable();
  table.destroy();

  data.forEach(function (country) {

    let name = country.name.common;

    var flag = country.flags.png;

    let spanishName = country.translations.spa.common;

    let officialName = country.name.official;

    let region = country.region;

    let capital = country.capital;

    let subregion = country.subregion;

    let continent = country.continents[0];

    let population = country.population;

    let borders = country.borders;

    let language = country.languages;

    let nativeName = '';

    if (language !== undefined) {
      let nombreDelIdioma = Object.keys(country.name.nativeName)[0];
      nativeName = country.name.nativeName[nombreDelIdioma].common;
    }

    tableHtml += '<tr>';
    tableHtml += createTableDataHtml(nativeName); 
    tableHtml += createTableDataHtml(name);
    tableHtml += createTableDataHtml(spanishName); 
    tableHtml += createTableDataHtml(officialName);

    if (capital) {
      tableHtml += createTableDataHtml(capital);
    } else {
      tableHtml += createTableDataHtml(' ');
    }

    tableHtml += createTableDataHtml(region);

    // '${name}','${name}','${name}','${name}','${name}','${country.flags.png}'  onclick = updateDetails('${name}')
    tableHtml +=
      `<td class="text-center text-truncate "> 
      <button class = "badge badge-dark" 
        onclick="updateDetails('${name}', '${officialName}', '${region}', '${subregion}', '${continent}', '${flag}', '${population}', '${borders}' )" >
          Ver detalles
      </button>
    </td>`;
    tableHtml += '</tr>';
  });

  // Set the innerHTML of the table's body
  var tableBody = document.getElementById('tbodytable1ID');
  tableBody.innerHTML = tableHtml;

  var table = dataTableSetProperties();
  table.draw();
}



function createTableDataHtml(content) {
  // Create and return the HTML string for a table cell
  return `<td class="text-center text-truncate">${content}</td>`;
}

/*Set porpeties to tables*/
function dataTableSetProperties() {
  // let table = new DataTable("#table1TableID", {
  return $('#table1TableID').DataTable(
    {
      select: true,
      bSort: true,
      paging: true,

      columns: [
        null,
        null,
        null,
        null,
        null,
        null,
        { orderable: false },
      ],

      language: {
        // lengthMenu: " _MENU_ ",
        search: "Filtrar:  ",

        paginate: {

          show: "Mostrando",
          fisrt: "Primer",
          previous: "Anterior",
          next: "Siguiente",
          last: "Ultimo",
        },
        info: "Mostrando página _PAGE_  de _PAGES_",
        infoEmpty: "No hay datos",
        emptyTable: "No hay paises disponibles",
      },
      pageLength: 20,
      // lengthMenu: [10, 25, 50, 75, 100],
      dom: "Bfrtip",
      buttons: ["copy", "excel", "pdf", "csv"],
    }
  );
}


// name, oficialName, region, subregion, continent, flag ,poblacion, pas1, pas2, pas3
function updateDetails(name, officialName, region, subregion, continent, flag, population, borders) {
  // ... Resto del código ...
  // var lista = JSON.parse(borders);
  borders = borders.split(',');

  let modalHtml = '';
  modalHtml +=
    `<div class="container-fluid" style = "font-size: smaller; " >
        <div class="col-md-1"> <img class="flagicon" src="${flag}" alt="Bandera"> </div>
        <ul style="display: inline-block; font-weight: bold; list-style: none;">
            <li>Comun: ${name}</li>
            <li>Oficial: ${officialName}</li>
            <li>Region: ${region}</li>
            <li>Subregion: ${subregion}</li>
            <li>Continente: ${continent}</li>
        </ul>
        <ul style=" float: right;">
            <li style = "list-style: none;">Poblacion: ${population}</li>`;

  if (borders[0] !== "undefined") {

    modalHtml += `<li style="list-style: none;">Fronteras:</li>`;

    const promises = borders.map(country => getCountryName(country));

    Promise.all(promises)
      .then(countryNames => {

        countryNames.forEach(countryName => {
          modalHtml += `<li>${countryName}</li>`;
        });

        modalHtml += `
              </ul>
          </div>`;
        document.getElementById('paisModalBodyID').innerHTML = modalHtml
        $('#paisModalID').modal('show');
      })
      .catch(error => {
        console.error('Error al obtener nombres de países limítrofes:', error);
      });
  }
  else {

    modalHtml += `
          </ul>
        </div>`;
    document.getElementById('paisModalBodyID').innerHTML = modalHtml
    $('#paisModalID').modal('show');
  }


}