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
        Schema::create('jadwals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('posyandu_id')->constrained()->onDelete('cascade');
            $table->date('tanggal');
            $table->string('kegiatan'); // e.g. Penimbangan Balita & Ibu Hamil
            $table->time('waktu_mulai')->default('08:00:00');
            $table->time('waktu_selesai')->default('11:00:00');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jadwals');
    }
};
