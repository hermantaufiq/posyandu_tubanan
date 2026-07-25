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
        Schema::create('laporan_fotos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('posyandu_id')->constrained('posyandus')->cascadeOnDelete();
            $table->foreignId('kader_id')->constrained('users')->cascadeOnDelete();
            $table->string('bulan', 20);
            $table->integer('tahun');
            $table->string('kategori'); // Lansia, Balita, dll
            $table->string('file_path'); // url/path foto
            $table->text('catatan')->nullable();
            $table->enum('status', ['menunggu_verifikasi', 'terverifikasi'])->default('menunggu_verifikasi');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('laporan_fotos');
    }
};
