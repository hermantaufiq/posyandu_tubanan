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
        Schema::table('laporan_pws', function (Blueprint $table) {
            $table->integer('tanggal')->nullable()->after('posyandu_id');
        });
        Schema::table('laporan_fotos', function (Blueprint $table) {
            $table->integer('tanggal')->nullable()->after('posyandu_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('laporan_tables', function (Blueprint $table) {
            //
        });
    }
};
