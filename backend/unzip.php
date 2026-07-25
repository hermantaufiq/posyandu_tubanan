<?php
$files = glob('*.zip');
if (count($files) === 0) {
    die("Error: Tidak ada file ZIP yang ditemukan di folder ini!");
}

$zipFile = $files[0];
echo "Ditemukan file zip: " . $zipFile . "<br>";

$zip = new ZipArchive;
$res = $zip->open($zipFile);
if ($res === TRUE) {
  $zip->extractTo('./');
  $zip->close();
  echo "<h3>Bagus! File sukses diekstrak!</h3>";
} else {
  echo "<h3>Gagal ekstrak! Kode error: " . $res . "</h3>";
}
?>
