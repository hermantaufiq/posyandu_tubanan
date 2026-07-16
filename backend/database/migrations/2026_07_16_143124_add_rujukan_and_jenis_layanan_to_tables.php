<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pemeriksaans', function (Blueprint $table) {
            $table->boolean('dirujuk')->default(false)->after('catatan');
            $table->string('alasan_rujukan')->nullable()->after('dirujuk');
            $table->string('usia_kandungan')->nullable()->after('gula_darah'); // e.g. "24 Minggu"
        });

        // Update antrians enum for jenis_layanan
        // Tapi di PostgreSQL, karena kolom 'jenis_layanan' itu string (dibuat via string() bukan enum() secara default Laravel string=varchar), kita tidak perlu ganti apa-apa.
        // Wait, in 2026_07_16_132342_add_jenis_layanan_and_diperiksa_to_antrians_table.php I used string('jenis_layanan')
        // So no constraint dropping needed for jenis_layanan.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pemeriksaans', function (Blueprint $table) {
            $table->dropColumn(['dirujuk', 'alasan_rujukan', 'usia_kandungan']);
        });
    }
};
