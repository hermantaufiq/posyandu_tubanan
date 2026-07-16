<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pemeriksaans', function (Blueprint $table) {
            $table->string('tensi')->nullable()->after('lingkar_kepala');        // Contoh: 120/80
            $table->string('gula_darah')->nullable()->after('tensi');           // Contoh: 95 mg/dL
            $table->string('imunisasi')->nullable()->after('gula_darah');       // Contoh: BCG, DPT-1
            $table->string('vitamin')->nullable()->after('imunisasi');          // Contoh: Vitamin A, Fe
        });
    }

    public function down(): void
    {
        Schema::table('pemeriksaans', function (Blueprint $table) {
            $table->dropColumn(['tensi', 'gula_darah', 'imunisasi', 'vitamin']);
        });
    }
};
