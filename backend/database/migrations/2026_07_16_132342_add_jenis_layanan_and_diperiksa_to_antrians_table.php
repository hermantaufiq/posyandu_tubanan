<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('antrians', function (Blueprint $table) {
            $table->string('jenis_layanan')->default('Balita/Umum');
        });

        // MySQL/TiDB compatible: modify status column to VARCHAR to support new values
        DB::statement("ALTER TABLE antrians MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'menunggu'");
    }

    public function down(): void
    {
        Schema::table('antrians', function (Blueprint $table) {
            $table->dropColumn('jenis_layanan');
        });
    }
};
