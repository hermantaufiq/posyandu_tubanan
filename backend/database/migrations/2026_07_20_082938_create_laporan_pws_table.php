<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('laporan_pws', function (Blueprint $table) {
            $table->id();
            $table->foreignId('posyandu_id')->constrained('posyandus')->cascadeOnDelete();
            $table->foreignId('kader_id')->constrained('users')->cascadeOnDelete();
            $table->string('bulan', 20); // misal "Juli" atau "07"
            $table->integer('tahun');
            $table->string('kategori_sasaran'); // Balita, Lansia, Usia Produktif, Remaja, dll
            $table->json('data'); // menyimpan rekap data angka tabel
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('laporan_pws');
    }
};
