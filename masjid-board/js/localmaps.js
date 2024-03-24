/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
let map, latitude, longitude, accuracy;

async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  latitude = parseFloat($('#latitude').val());
  longitude = parseFloat($('#longitude').val());
  accuracy = parseFloat($('#accuracy').val());

  let zoom = 10;
  if (accuracy < 1000){zoom = 18}

  console.log(accuracy, zoom)

  map = new Map(document.getElementById("map"), {
    center: { lat: latitude, lng: longitude },
    zoom: zoom,
    mapId: "DEMO_MAP_ID",
  });

  const marker = new AdvancedMarkerElement({
    map: map,
    position: { lat: latitude, lng: longitude },
    title: "Lokasi Anda",
    gmpDraggable: true,
  });

  marker.addListener("dragend", (event) => {
    const position = marker.position;
    
    $('#latitude').val(position.lat);
    $('#longitude').val(position.lng);
    
  });
}

initMap();