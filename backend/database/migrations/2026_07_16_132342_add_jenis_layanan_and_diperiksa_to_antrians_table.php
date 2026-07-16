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

        // PostgreSQL: drop old enum check and recreate with 'diperiksa' added
        DB::statement("ALTER TABLE antrians DROP CONSTRAINT IF EXISTS antrians_status_check");
        DB::statement("ALTER TABLE antrians ALTER COLUMN status TYPE VARCHAR(20)");
        DB::statement("ALTER TABLE antrians ADD CONSTRAINT antrians_status_check CHECK (status IN ('menunggu','diperiksa','selesai','batal'))");
        DB::statement("ALTER TABLE antrians ALTER COLUMN status SET DEFAULT 'menunggu'");
    }

    public function down(): void
    {
        Schema::table('antrians', function (Blueprint $table) {
            $table->dropColumn('jenis_layanan');
        });
    }
};
