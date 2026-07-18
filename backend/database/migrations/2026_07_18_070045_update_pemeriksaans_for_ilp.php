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
        Schema::table('pemeriksaans', function (Blueprint $table) {
            // Ubah balita_id menjadi nullable (untuk backward compatibility sementara)
            $table->unsignedBigInteger('balita_id')->nullable()->change();
            
            // Tambahkan user_id (pasien untuk semua usia)
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            
            // Kolom pengukuran tambahan ILP
            $table->decimal('lingkar_perut', 5, 2)->nullable();
            $table->decimal('lila', 5, 2)->nullable(); // Lingkar Lengan Atas
            
            // Kolom Skrining Meja 3 (Kader)
            $table->json('skrining_tbc')->nullable(); // 4 Indikator (Batuk, Demam, Keringat, BB turun)
            $table->json('skrining_lansia')->nullable(); // Penilaian AKS (Aktivitas Kehidupan Sehari-hari)
            $table->json('skrining_ptm')->nullable(); // Hipertensi, Gula Darah (bisa masuk sini atau pakai tensi/gula_darah existing)
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pemeriksaans', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn(['user_id', 'lingkar_perut', 'lila', 'skrining_tbc', 'skrining_lansia', 'skrining_ptm']);
            $table->unsignedBigInteger('balita_id')->nullable(false)->change();
        });
    }
};
